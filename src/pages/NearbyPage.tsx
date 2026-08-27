import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BENEFITS } from '../data'
import { PARTNER_GEO, WEEKLY_PICKS } from '../data/picks'
import { formatDistance, haversineMeters } from '../geo'
import { fetchOsrmTrip } from '../osrm'
import { useOrigin } from '../useOrigin'
import { PartnerNearList } from '../components/PartnerNearList'
import { PageHeader } from '../components/PageHeader'
import { YangguMap } from '../components/YangguMap'

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
  const requestKey = activeId ? `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}|${activeId}` : ''
  const fallbackPath = useMemo(() => {
    if (!activeId || !PARTNER_GEO[activeId]) return undefined
    const to = PARTNER_GEO[activeId]
    return [
      [origin.lat, origin.lng],
      [to.lat, to.lng],
    ] as [number, number][]
  }, [origin, activeId])
  const [road, setRoad] = useState<{ key: string; path: [number, number][] } | null>(null)
  const path = road?.key === requestKey ? road.path : fallbackPath

  useEffect(() => {
    if (!activeId || !PARTNER_GEO[activeId]) return
    const ac = new AbortController()
    const key = requestKey
    void fetchOsrmTrip([origin, PARTNER_GEO[activeId]], ac.signal)
      .then((trip) => {
        if (ac.signal.aborted || !trip?.path) return
        setRoad({ key, path: trip.path })
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
      })
    return () => ac.abort()
  }, [origin, activeId, requestKey])

  return (
    <>
      <PageHeader
        kicker="주변"
        title={story ? story.title : '내 주변 사이버 군민 혜택'}
        desc={story ? story.line : '가까운 제휴점에서 군민증으로 받을 수 있는 혜택'}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {story ? (
          <p className="text-sm font-semibold text-gray-600">
            군민증 혜택 받을 수 있는 곳 {items.length}곳
            {nearest ? ` · 가장 가까운 곳 ${formatDistance(nearest.meters)}` : ''}
          </p>
        ) : (
          <p className="text-sm text-gray-600">현재 위치를 기준으로 가까운 제휴점을 보여드립니다.</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">{located ? '현재 위치' : '양구읍 기준'}</p>
          <button
            type="button"
            onClick={() => void locate()}
            className="rounded-full bg-main-50 px-3 py-1.5 text-xs font-bold text-main"
          >
            {locating ? '찾는 중...' : '내 위치로'}
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-gray-500">{error} 양구읍을 기준으로 보여드립니다.</p> : null}

        <div className="mt-4">
          <YangguMap
            origin={origin}
            pins={items.map((item) => ({
              id: item.id,
              point: PARTNER_GEO[item.id],
              label: item.category,
            }))}
            selectedId={activeId}
            onSelect={setSelected}
            path={path}
            badge="양구"
          />
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
