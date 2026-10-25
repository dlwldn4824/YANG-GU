import { useCallback, useEffect, useState } from 'react'
import { boothById } from '../data/booths'

type Stats = {
  today: string
  daily: { date: string; visitors: number; views: number }[]
  total: { visitors: number; views: number }
  paths: Record<string, number>
  sources: Record<string, number>
  booths: Record<string, number>
  recent: { t: number; path: string; source: string; booth: string; who: string; device: string }[]
}

const PAGE_NAMES: Record<string, string> = {
  '/': '홈',
  '/yanggu': '배꼬비 키우기',
  '/card': '내 군민증',
  '/pick': '추천',
  '/login': '로그인',
  '/food': '음식점',
  '/benefits': '혜택',
  '/faq': 'FAQ',
}

function pageName(path: string) {
  const booth = path.match(/^\/q\/([^/]+)/)?.[1]
  if (booth) return `QR · ${boothById(booth)?.name ?? booth}`
  if (path.startsWith('/pick/')) return '추천 상세'
  return PAGE_NAMES[path] ?? path
}

function time(t: number) {
  return new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' })
}

// 방문 기록 확인용 화면. 메뉴에는 없고 /stats 로만 들어온다.
export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/visit?days=7')
      if (!res.ok) throw new Error(String(res.status))
      setStats((await res.json()) as Stats)
      setError('')
    } catch {
      setError('방문 기록을 불러오지 못했어요.')
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), 30_000)
    return () => window.clearInterval(timer)
  }, [load])

  const today = stats?.daily[0]

  return (
    <main className="wrap py-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-sub">방문 기록</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold">오늘 누가 들어왔나</h1>
        </div>
        <button type="button" onClick={() => void load()} className="text-sm font-bold text-main">
          새로고침
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-gray-500">{error}</p> : null}

      {stats ? (
        <>
          <section className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Tile label="오늘 방문자" value={today?.visitors ?? 0} strong />
            <Tile label="오늘 페이지뷰" value={today?.views ?? 0} />
            <Tile label="전체 방문자" value={stats.total.visitors} />
            <Tile label="전체 페이지뷰" value={stats.total.views} />
          </section>
          <p className="mt-2 text-xs text-gray-500">방문자는 휴대폰(브라우저) 기준이에요. 30초마다 새로 불러와요.</p>

          <section className="mt-8">
            <h2 className="font-display text-xl font-extrabold">최근 7일</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-1 font-bold">날짜</th>
                  <th className="py-1 text-right font-bold">방문자</th>
                  <th className="py-1 text-right font-bold">페이지뷰</th>
                </tr>
              </thead>
              <tbody>
                {stats.daily.map((day) => (
                  <tr key={day.date} className="border-t border-gray-100">
                    <td className="py-2">{day.date.slice(5).replace('-', '/')}</td>
                    <td className="py-2 text-right font-bold">{day.visitors.toLocaleString('ko-KR')}</td>
                    <td className="py-2 text-right">{day.views.toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Ranked title="오늘 많이 본 화면" items={stats.paths} label={pageName} />
            <Ranked title="오늘 부스 QR" items={stats.booths} label={(id) => boothById(id)?.name ?? id} empty="아직 QR 스캔이 없어요." />
            <Ranked title="오늘 들어온 경로" items={stats.sources} label={(s) => s} empty="?from= 이 붙은 링크로 들어온 방문이 없어요." />
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl font-extrabold">최근 방문</h2>
            <ul className="mt-3 divide-y divide-gray-100 text-sm">
              {stats.recent.map((item, i) => (
                <li key={`${item.t}-${i}`} className="flex items-center gap-3 py-2">
                  <span className="w-12 shrink-0 text-xs text-gray-500">{time(item.t)}</span>
                  <span className="min-w-0 flex-1 truncate font-bold">{pageName(item.path)}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {item.device} · #{item.who}
                    {item.source ? ` · ${item.source}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  )
}

function Tile({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${strong ? 'bg-main text-white' : 'bg-main-50'}`}>
      <p className={`text-xs font-bold ${strong ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
      <p className="font-display mt-1 text-2xl font-extrabold">{value.toLocaleString('ko-KR')}</p>
    </div>
  )
}

function Ranked({
  title,
  items,
  label,
  empty = '아직 기록이 없어요.',
}: {
  title: string
  items: Record<string, number>
  label: (key: string) => string
  empty?: string
}) {
  const rows = Object.entries(items).sort((a, b) => b[1] - a[1])
  return (
    <section>
      <h2 className="text-sm font-extrabold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-gray-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {rows.map(([key, count]) => (
            <li key={key} className="flex justify-between gap-3">
              <span className="truncate">{label(key)}</span>
              <span className="font-bold">{count.toLocaleString('ko-KR')}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
