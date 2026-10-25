// 회원가입·로그인 API (Vercel Function + Upstash Redis)
// POST /api/auth?action=signup { name, email, password, birth?, design } → { token, user }
// POST /api/auth?action=login  { email, password }                      → { token, user }
// POST /api/auth?action=logout (Authorization: Bearer <token>)
// GET  /api/auth               (Authorization: Bearer <token>)          → { user }
// 비밀번호는 scrypt로 바꿔서 저장하고 원문은 남기지 않는다.

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import {
  SESSION_TTL,
  bearer,
  fail,
  json,
  publicUser,
  redis,
  sessionKey,
  userFromRequest,
  userKey,
  type User,
} from './_redis.js'

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>

async function hashPassword(password: string, salt: string) {
  return (await scryptAsync(password, salt, 32)).toString('hex')
}

function kstToday() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
}

function addYears(iso: string, years: number) {
  return `${Number(iso.slice(0, 4)) + years}${iso.slice(4)}`
}

async function startSession(email: string) {
  const token = randomBytes(32).toString('hex')
  await redis([['SET', sessionKey(token), email, 'EX', SESSION_TTL]])
  return token
}

type Body = Record<string, unknown>

function text(body: Body, key: string, max: number) {
  const value = body[key]
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

async function signup(body: Body) {
  const name = text(body, 'name', 12)
  const email = text(body, 'email', 80).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const birth = text(body, 'birth', 10)
  const design = Number(body.design)
  if (!name) return json({ error: '이름을 입력해 주세요.' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: '이메일 형식이 올바르지 않아요.' }, 400)
  if (password.length < 6 || password.length > 72) return json({ error: '비밀번호는 6자 이상이어야 해요.' }, 400)
  if (birth && !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return json({ error: '생년월일 형식이 올바르지 않아요.' }, 400)
  if (![1, 2, 3, 4].includes(design)) return json({ error: '군민증 디자인을 골라 주세요.' }, 400)

  const salt = randomBytes(16).toString('hex')
  const [seq] = await redis([['INCR', 'user:seq']])
  const issuedAt = kstToday()
  const user: User = {
    id: randomBytes(12).toString('hex'),
    name,
    email,
    birth,
    design: design as User['design'],
    cardNo: `YG-${issuedAt.slice(0, 4)}-${String(1000 + Number(seq)).padStart(4, '0')}`,
    issuedAt,
    expiresAt: addYears(issuedAt, 3),
    salt,
    hash: await hashPassword(password, salt),
  }
  // 같은 이메일이 이미 있으면 덮어쓰지 않는다.
  const [created] = await redis([['SET', userKey(email), JSON.stringify(user), 'NX']])
  if (created !== 'OK') return json({ error: '이미 가입된 이메일이에요. 로그인해 주세요.' }, 409)
  return json({ token: await startSession(email), user: publicUser(user) })
}

async function login(body: Body) {
  const email = text(body, 'email', 80).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const [raw] = await redis([['GET', userKey(email)]])
  const wrong = json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' }, 401)
  if (typeof raw !== 'string') return wrong
  const user = JSON.parse(raw) as User
  const given = Buffer.from(await hashPassword(password, user.salt), 'hex')
  const saved = Buffer.from(user.hash, 'hex')
  if (given.length !== saved.length || !timingSafeEqual(given, saved)) return wrong
  return json({ token: await startSession(email), user: publicUser(user) })
}

export async function POST(request: Request) {
  const action = new URL(request.url).searchParams.get('action')
  try {
    if (action === 'logout') {
      const token = bearer(request)
      if (token) await redis([['DEL', sessionKey(token)]])
      return json({ ok: true })
    }
    let body: Body
    try {
      body = (await request.json()) as Body
    } catch {
      return json({ error: 'bad-json' }, 400)
    }
    if (action === 'signup') return await signup(body)
    if (action === 'login') return await login(body)
    return json({ error: 'unknown-action' }, 400)
  } catch (error) {
    return fail(error)
  }
}

export async function GET(request: Request) {
  try {
    const user = await userFromRequest(request)
    return user ? json({ user: publicUser(user) }) : json({ error: 'not-logged-in' }, 401)
  } catch (error) {
    return fail(error)
  }
}
