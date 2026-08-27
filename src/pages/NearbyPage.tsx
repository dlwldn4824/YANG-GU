import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BENEFITS } from '../data'
import { PARTNER_GEO, WEEKLY_PICKS } from '../data/picks'
import { formatDistance, haversineMeters, pointToPercent } from '../geo'
import { useOrigin } from '../useOrigin'
import { PartnerNearList } from '../components/PartnerNearList'
import { PageHeader } from '../components/PageHeader'

export function NearbyPage() {
  const [params] = useSearchParams()
  const pickId = params.get('pick') ?? ''
  const story = WEEKLY_PICKS.find((item) => item.id === pickId)
  const { origin, located, locating, error, locate } = useOrigin()
  const [selected, setSelected] = useState<string | null>(null)

  const items = useMemo(() => {
    const filtered = BENEFITS.filter((benefit) => {
      if (!PARTNER_GEO[benefit.id]) return false
      if (!story) return true
      return story.partnerIds.includes(benefit.id)
    })
    return filtered
      .map((benefit) => ({
        ...benefit,
        meters: haversineMeters(origin, PARTNER_GEO[benefit.id]),
      }))
      .sort((a, b) => a.meters - b.meters)
  }, [origin, story])

  const activeId = items.some((item) => item.id === selected) ? selected : (items[0]?.id ?? null)
  const nearest = items[0]

  return (
    <>
      <PageHeader
        kicker="NEARBY"
        title={story ? story.title : '내 주변 사이버 군민 혜택'}
        desc={story ? story.line : '가까운 제휴점에서 군민증으로 받을 수 있는 혜택'}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {story ? (
          <p className="text-sm font-semibold text-gray-600">
            {story.emoji} 군민증 혜택 받을 수 있는 곳 {items.length}곳
            {nearest ? ` · 가장 가까운 곳 ${formatDistance(nearest.meters)}` : ''}
          </p>
        ) : (
          <p className="text-sm text-gray-600">현재 위치를 기준으로 가까운 제휴점을 보여드립니다.</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">📍 {located ? '현재 위치' : '양구읍 기준'}</p>
          <button
            type="button"
            onClick={() => void locate()}
            className="rounded-full bg-main-50 px-3 py-1.5 text-xs font-bold text-main"
          >
            {locating ? '찾는 중...' : '내 위치로'}
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-gray-500">{error} 양구읍을 기준으로 보여드립니다.</p> : null}

        <div className="relative mt-4 h-64 overflow-hidden rounded-2xl border border-main-100 bg-[linear-gradient(180deg,#dae5d2_0%,#ecf2e8_55%,#f7f3e8_100%)]">
          <p className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-main">
            양구
          </p>
          <span
            className="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#3b82f6] shadow"
            style={pointToPercent(origin)}
            title="현재 위치"
          />
          {items.map((item) => {
            const pos = pointToPercent(PARTNER_GEO[item.id])
            const active = activeId === item.id
            return (
              <button
                key={item.id}
                type="button"
                title={item.title}
                onClick={() => setSelected(item.id)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-full ${active ? 'scale-110' : ''}`}
                style={pos}
              >
                <span
                  className={`block rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow ${
                    active ? 'bg-point' : 'bg-main'
                  }`}
                >
                  {item.category}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          <PartnerNearList items={items} selectedId={activeId} onSelect={setSelected} />
        </div>

        {story ? (
          <p className="mt-6 text-center">
            <Link to="/nearby" className="text-sm font-bold text-main">
              제휴점 전체 지도 보기
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-center">
            <Link to="/comma" className="text-sm font-bold text-main">
              오래 머물기 좋은 쉼표 보기
            </Link>
          </p>
        )}
      </main>
    </>
  )
}
