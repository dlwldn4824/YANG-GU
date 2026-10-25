// API들이 같이 쓰는 Upstash Redis 연결. 이름이 _ 로 시작해서 주소(/api/...)로 열리지는 않는다.

export type Command = (string | number)[]

// Vercel에서 Upstash를 연결할 때 접두어를 바꾸면 이름이 STORAGE_KV_REST_API_URL 처럼 달라진다.
function redisEnv() {
  const env = process.env
  const urlKey = Object.keys(env).find(
    (key) => /(^|_)KV_REST_API_URL$/.test(key) || /(^|_)REDIS_REST_URL$/.test(key),
  )
  if (!urlKey) return null
  const token = env[urlKey.replace(/_URL$/, '_TOKEN')]
  const url = env[urlKey]
  return url && token ? { url, token } : null
}

export async function redis(commands: Command[]) {
  const env = redisEnv()
  if (!env) throw new Error('no-redis')
  const res = await fetch(`${env.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`redis ${res.status}`)
  const rows = (await res.json()) as { result?: unknown; error?: string }[]
  return rows.map((row) => {
    if (row.error) throw new Error(row.error)
    return row.result
  })
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export function fail(error: unknown) {
  const message = error instanceof Error ? error.message : 'error'
  return json({ error: message }, message === 'no-redis' ? 503 : 500)
}

export type User = {
  id: string
  name: string
  email: string
  birth: string
  design: 1 | 2 | 3 | 4
  cardNo: string
  issuedAt: string
  expiresAt: string
  salt: string
  hash: string
}

export const userKey = (email: string) => `user:${email}`
export const sessionKey = (token: string) => `session:${token}`
export const SESSION_TTL = 60 * 60 * 24 * 60

export function bearer(request: Request) {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  return /^[a-f0-9]{64}$/.test(token) ? token : ''
}

// 로그인 토큰으로 계정을 찾는다. 없거나 만료됐으면 null.
export async function userFromRequest(request: Request): Promise<User | null> {
  const token = bearer(request)
  if (!token) return null
  const [email] = await redis([['GET', sessionKey(token)]])
  if (typeof email !== 'string') return null
  const [raw] = await redis([['GET', userKey(email)]])
  return typeof raw === 'string' ? (JSON.parse(raw) as User) : null
}

export function publicUser(user: User) {
  const { salt: _salt, hash: _hash, ...rest } = user
  return rest
}
