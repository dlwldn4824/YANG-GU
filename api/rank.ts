// 배꼬비 랭킹 API (Vercel Function + Upstash Redis)
// GET  /api/rank?id=<계정 id>                                  → 상위 랭커와 내 순위
// POST /api/rank { xp, level } (Authorization: Bearer <token>) → 로그인한 계정의 점수 올리기
// 이름과 계정 id는 로그인 정보에서 가져오므로 다른 사람 이름으로 점수를 올릴 수 없다.

import { fail, json, redis, userFromRequest } from './_redis.js'

// 계정 기준으로 바꾸면서 휴대폰 기준이던 예전 랭킹과 분리했다.
const BOARD = 'kkobi:rank:v2'
const PROFILE = 'kkobi:profile:v2'
const TOP = 20
const MAX_XP = 500_000

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
    return fail(error)
  }
}

export async function POST(request: Request) {
  let body: { xp?: unknown; level?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad-json' }, 400)
  }
  const xp = Math.round(Number(body.xp))
  const level = Math.round(Number(body.level))
  if (!Number.isFinite(xp) || xp < 0 || xp > MAX_XP || !(level >= 1 && level <= 5)) {
    return json({ error: 'bad-input' }, 400)
  }
  try {
    const user = await userFromRequest(request)
    if (!user) return json({ error: 'not-logged-in' }, 401)
    // 다른 휴대폰에서 더 높게 올린 점수가 있으면 낮은 점수로 덮어쓰지 않는다.
    const [before] = await redis([['ZSCORE', BOARD, user.id]])
    const higher = before == null || xp >= Number(before)
    const [rank, score] = await redis([
      ...(higher
        ? [
            ['ZADD', BOARD, xp, user.id],
            ['HSET', PROFILE, user.id, JSON.stringify({ name: user.name, level })],
          ]
        : []),
      ['ZREVRANK', BOARD, user.id],
      ['ZSCORE', BOARD, user.id],
    ]).then((rows) => rows.slice(-2))
    return json({ me: { rank: Number(rank) + 1, xp: Number(score) } })
  } catch (error) {
    return fail(error)
  }
}
