import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BENEFITS } from '../data'
import { COMMA_SPACES, PARTNER_GEO, WEEKLY_PICKS, isCommaPartner } from '../data/picks'
import { formatDistance, haversineMeters } from '../geo'
import { fetchOsrmTrip } from '../osrm'
import { useOrigin } from '../useOrigin'
import { PartnerNearList } from '../components/PartnerNearList'
import { PageHeader } from '../components/PageHeader'
import { YangguMap } from '../components/YangguMap'

const COMMA_PERK = Object.fromEntries(COMMA_SPACES.map((space) => [space.partnerId, space.stayPerk]))

export function NearbyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const pickId = params.get('pick') ?? ''
  const story = WEEKLY_PICKS.find((item) => item.id === pickId)
  const { origin, located, locating, error, locate } = useOrigin()
  const [selected, setSelected] = useState<string | null>(null)
  const filter = params.get('comma') === '1' ? 'comma' : 'all'

  const items = useMemo(() => {
    const filtered = BENEFITS.filter((benefit) => {
      if (!PARTNER_GEO[benefit.id]) return false
      if (story) return story.partnerIds.includes(benefit.id)
      if (filter === 'comma') return isCommaPartner(benefit.id)
      return true
    })
    return filtered
      .map((benefit) => ({
        ...benefit,
        meters: haversineMeters(origin, PARTNER_GEO[benefit.id]),
        comma: isCommaPartner(benefit.id),
        stayPerk: COMMA_PERK[benefit.id],
      }))
      .sort((a, b) => a.meters - b.meters)
  }, [origin, story, filter])

  const activeId = items.some((item) => item.id === selected) ? selected : (items[0]?.id ?? null)
  const nearest = items[0]
  const commaCount = items.filter((item) => item.comma).length
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
        kicker="지도"
        title={story ? story.title : '제휴 매장'}
        desc={
          story
            ? story.line
            : '군민증으로 할인되는 곳입니다. 주황 핀은 오래 머물 수 있는 매장입니다.'
        }
      />
      <main className="wrap py-6">
        <p className="text-sm font-semibold text-gray-600">
          {filter === 'comma' ? `쉼표 지원 매장 ${items.length}곳` : `제휴점 ${items.length}곳`}
          {commaCount > 0 && filter === 'all' ? ` · 쉼표 ${commaCount}곳` : ''}
          {nearest ? ` · 가장 가까운 곳 ${formatDistance(nearest.meters)}` : ''}
        </p>

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

        {!story ? (
          <div className="mt-4 flex gap-2">
            <FilterChip active={filter === 'all'} onClick={() => navigate('/nearby')} label="전체 제휴" />
            <FilterChip
              active={filter === 'comma'}
              onClick={() => navigate('/nearby?comma=1')}
              label="쉼표 지원 매장"
            />
          </div>
        ) : null}

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,1fr)]">
          <div className="lg:sticky lg:top-20">
            <YangguMap
              origin={origin}
              pins={items.map((item) => ({
                id: item.id,
                point: PARTNER_GEO[item.id],
                label: item.comma ? '쉼표' : item.category,
                tone: item.comma ? 'comma' : 'partner',
              }))}
              selectedId={activeId}
              onSelect={setSelected}
              path={path}
              badge={filter === 'comma' ? '쉼표 매장' : '제휴 지도'}
              className="h-72 lg:h-[min(70vh,40rem)]"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-point align-middle" /> 쉼표 지원
              <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-full bg-main align-middle" /> 제휴점
            </p>
          </div>
          <div>
            <PartnerNearList items={items} selectedId={activeId} onSelect={setSelected} />
            {story ? (
              <p className="mt-6 text-center">
                <Link to="/nearby" className="text-sm font-bold text-main">
                  제휴점 전체 지도 보기
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-center">
                <Link to="/food" className="text-sm font-bold text-main">
                  양구 음식점 안내 보기
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
        active ? 'bg-main text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}
