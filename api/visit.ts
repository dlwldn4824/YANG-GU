// 방문 기록 API (Vercel Function + Upstash Redis)
// POST /api/visit { id, path, source?, booth? } → 페이지를 열 때마다 하나씩 쌓는다
// GET  /api/visit?days=7                      → 날짜별 방문자·페이지뷰, 오늘 많이 본 화면, 최근 기록
// IP나 이름은 저장하지 않는다. id는 휴대폰마다 만든 무작위 번호다.

const DAY_TTL = 60 * 60 * 24 * 120
const LOG = 'visit:log'
const LOG_SIZE = 300

type Command = (string | number)[]

// 랭킹 API와 같은 방식으로 Upstash 환경변수를 찾는다 (api/rank.ts 참고).
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

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : 'error'
  return json({ error: message }, message === 'no-redis' ? 503 : 500)
}

// 한국 시간 기준 날짜
function kstDay(offset = 0) {
  return new Date(Date.now() + 9 * 3600_000 - offset * 86400_000).toISOString().slice(0, 10)
}

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function device(ua: string) {
  if (/iPhone|iPad/.test(ua)) return 'iPhone'
  if (/Android/.test(ua)) return 'Android'
  if (/Mac|Windows|Linux/.test(ua)) return 'PC'
  return '기타'
}

function pairs(flat: unknown) {
  const list = (flat as string[] | null) ?? []
  const out: Record<string, number> = {}
  for (let i = 0; i < list.length; i += 2) out[list[i]] = Number(list[i + 1])
  return out
}

export async function POST(request: Request) {
  let body: { id?: unknown; path?: unknown; source?: unknown; booth?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad-json' }, 400)
  }
  const id = clean(body.id, 48)
  const path = clean(body.path, 80)
  if (!/^[a-zA-Z0-9-]{8,48}$/.test(id) || !path.startsWith('/')) return json({ error: 'bad-input' }, 400)
  const source = clean(body.source, 30)
  const booth = clean(body.booth, 40)
  const day = kstDay()
  const key = (name: string) => `visit:${day}:${name}`
  const entry = {
    t: Date.now(),
    path,
    source,
    booth,
    who: id.slice(0, 6),
    device: device(request.headers.get('user-agent') ?? ''),
  }

  const commands: Command[] = [
    ['PFADD', key('uv'), id],
    ['INCR', key('pv')],
    ['HINCRBY', key('path'), path, 1],
    ['PFADD', 'visit:all:uv', id],
    ['INCR', 'visit:all:pv'],
    ['LPUSH', LOG, JSON.stringify(entry)],
    ['LTRIM', LOG, 0, LOG_SIZE - 1],
  ]
  if (source) commands.push(['HINCRBY', key('source'), source, 1])
  if (booth) commands.push(['HINCRBY', key('booth'), booth, 1])
  for (const name of ['uv', 'pv', 'path', 'source', 'booth']) commands.push(['EXPIRE', key(name), DAY_TTL])

  try {
    await redis(commands)
    return json({ ok: true })
  } catch (error) {
    return fail(error)
  }
}

export async function GET(request: Request) {
  const days = Math.min(30, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 7))
  const dates = Array.from({ length: days }, (_, i) => kstDay(i))
  const today = dates[0]
  try {
    const rows = await redis([
      ...dates.flatMap((date): Command[] => [
        ['PFCOUNT', `visit:${date}:uv`],
        ['GET', `visit:${date}:pv`],
      ]),
      ['PFCOUNT', 'visit:all:uv'],
      ['GET', 'visit:all:pv'],
      ['HGETALL', `visit:${today}:path`],
      ['HGETALL', `visit:${today}:source`],
      ['HGETALL', `visit:${today}:booth`],
      ['LRANGE', LOG, 0, 49],
    ])
    const daily = dates.map((date, i) => ({
      date,
      visitors: Number(rows[i * 2] ?? 0),
      views: Number(rows[i * 2 + 1] ?? 0),
    }))
    const rest = rows.slice(dates.length * 2)
    return json({
      today,
      daily,
      total: { visitors: Number(rest[0] ?? 0), views: Number(rest[1] ?? 0) },
      paths: pairs(rest[2]),
      sources: pairs(rest[3]),
      booths: pairs(rest[4]),
      recent: ((rest[5] as string[] | null) ?? []).map((raw) => JSON.parse(raw)),
    })
  } catch (error) {
    return fail(error)
  }
}
