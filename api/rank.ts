// 배꼬비 랭킹 API (Vercel Function + Upstash Redis)
// GET  /api/rank?id=<rankerId>        → 상위 랭커와 내 순위
// POST /api/rank { id, name, xp, level } → 내 점수 올리기

const BOARD = 'kkobi:rank'
const PROFILE = 'kkobi:profile'
const TOP = 20
const MAX_XP = 500_000

type Command = (string | number)[]

function redisEnv() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function redis(commands: Command[]) {
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function validId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9-]{8,48}$/.test(id)
}

function parseProfile(raw: unknown) {
  try {
    const parsed = JSON.parse(String(raw)) as { name?: string; level?: number }
    return { name: parsed.name ?? '배꼬비 친구', level: parsed.level ?? 1 }
  } catch {
    return { name: '배꼬비 친구', level: 1 }
  }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  try {
    const [flat, rank, score] = await redis([
      ['ZRANGE', BOARD, 0, TOP - 1, 'REV', 'WITHSCORES'],
      ['ZREVRANK', BOARD, validId(id) ? id : '-'],
      ['ZSCORE', BOARD, validId(id) ? id : '-'],
    ])
    const pairs = flat as string[]
    const ids = pairs.filter((_, i) => i % 2 === 0)
    const profiles = ids.length > 0 ? ((await redis([['HMGET', PROFILE, ...ids]]))[0] as unknown[]) : []
    const top = ids.map((member, i) => ({
      id: member,
      rank: i + 1,
      xp: Number(pairs[i * 2 + 1]),
      ...parseProfile(profiles[i]),
    }))
    const me = rank == null ? null : { rank: Number(rank) + 1, xp: Number(score) }
    return json({ top, me })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'error'
    return json({ error: message }, message === 'no-redis' ? 503 : 500)
  }
}

export async function POST(request: Request) {
  let body: { id?: unknown; name?: unknown; xp?: unknown; level?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad-json' }, 400)
  }
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 12) : ''
  const xp = Math.round(Number(body.xp))
  const level = Math.round(Number(body.level))
  if (!validId(body.id) || !name || !Number.isFinite(xp) || xp < 0 || xp > MAX_XP || level < 1 || level > 5) {
    return json({ error: 'bad-input' }, 400)
  }
  try {
    const [, , rank] = await redis([
      ['ZADD', BOARD, xp, body.id],
      ['HSET', PROFILE, body.id, JSON.stringify({ name, level })],
      ['ZREVRANK', BOARD, body.id],
    ])
    return json({ me: { rank: Number(rank) + 1, xp } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'error'
    return json({ error: message }, message === 'no-redis' ? 503 : 500)
  }
}
