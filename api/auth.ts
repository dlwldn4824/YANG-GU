// 회원가입·로그인 API (Vercel Function + Upstash Redis)
// POST /api/auth?action=signup { name, email, password, birth?, design } → { token, user }
// POST /api/auth?action=login  { email, password }                      → { token, user }
// POST /api/auth?action=logout (Authorization: Bearer <token>)
// POST /api/auth?action=google { credential }                          → { token, user }
// GET  /api/auth               (Authorization: Bearer <token>)          → { user }
// GET  /api/auth?action=config                                          → { googleClientId }
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
  const hash = await hashPassword(password, salt)
  const user = await createUser({ name, email, birth, design: design as User['design'], salt, hash })
  if (!user) return json({ error: '이미 가입된 이메일이에요. 로그인해 주세요.' }, 409)
  return json({ token: await startSession(email), user: publicUser(user) })
}

// 새 계정을 만든다. 같은 이메일이 이미 있으면 덮어쓰지 않고 null을 돌려준다.
async function createUser(fields: Pick<User, 'name' | 'email' | 'birth' | 'design' | 'salt' | 'hash'>) {
  const [seq] = await redis([['INCR', 'user:seq']])
  const issuedAt = kstToday()
  const user: User = {
    id: randomBytes(12).toString('hex'),
    ...fields,
    cardNo: `YG-${issuedAt.slice(0, 4)}-${String(1000 + Number(seq)).padStart(4, '0')}`,
    issuedAt,
    expiresAt: addYears(issuedAt, 3),
  }
  const [created] = await redis([['SET', userKey(fields.email), JSON.stringify(user), 'NX']])
  return created === 'OK' ? user : null
}

type GoogleToken = { aud?: string; iss?: string; email?: string; email_verified?: string | boolean; name?: string; exp?: string }

// 구글이 준 ID 토큰을 구글 서버에 물어 확인한다. 우리 Client ID로 발급된, 이메일 인증된 토큰만 받는다.
async function verifyGoogle(credential: string, clientId: string) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
  if (!res.ok) return null
  const token = (await res.json()) as GoogleToken
  const issuerOk = token.iss === 'accounts.google.com' || token.iss === 'https://accounts.google.com'
  const verified = token.email_verified === true || token.email_verified === 'true'
  const fresh = Number(token.exp) * 1000 > Date.now()
  if (token.aud !== clientId || !issuerOk || !verified || !fresh || !token.email) return null
  return { email: token.email.toLowerCase(), name: token.name ?? '' }
}

async function google(body: Body) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return json({ error: '구글 로그인이 아직 준비되지 않았어요.' }, 400)
  const credential = typeof body.credential === 'string' ? body.credential : ''
  const profile = credential ? await verifyGoogle(credential, clientId) : null
  if (!profile) return json({ error: '구글 로그인을 확인하지 못했어요. 다시 시도해 주세요.' }, 401)

  // 같은 이메일로 이미 가입했으면 그 계정으로 들어간다.
  const [raw] = await redis([['GET', userKey(profile.email)]])
  let user = typeof raw === 'string' ? (JSON.parse(raw) as User) : null
  if (!user) {
    const name = (profile.name || profile.email.split('@')[0]).trim().slice(0, 12)
    user = await createUser({ name, email: profile.email, birth: '', design: 4, salt: '', hash: '' })
    // 동시에 두 번 눌러 한쪽이 먼저 만든 경우
    if (!user) {
      const [again] = await redis([['GET', userKey(profile.email)]])
      user = JSON.parse(String(again)) as User
    }
  }
  return json({ token: await startSession(profile.email), user: publicUser(user) })
}

async function login(body: Body) {
  const email = text(body, 'email', 80).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const [raw] = await redis([['GET', userKey(email)]])
  const wrong = json({ error: '이메일 또는 비밀번호가 올바르지 않아요.' }, 401)
  if (typeof raw !== 'string') return wrong
  const user = JSON.parse(raw) as User
  if (!user.hash) return json({ error: '구글로 가입한 계정이에요. "Google로 계속하기"를 눌러 주세요.' }, 401)
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
    if (action === 'google') return await google(body)
    return json({ error: 'unknown-action' }, 400)
  } catch (error) {
    return fail(error)
  }
}

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get('action') === 'config') {
    return json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null })
  }
  try {
    const user = await userFromRequest(request)
    return user ? json({ user: publicUser(user) }) : json({ error: 'not-logged-in' }, 401)
  } catch (error) {
    return fail(error)
  }
}
