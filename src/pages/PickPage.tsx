import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BENEFITS } from '../data'
import { PARTNER_GEO, WEEKLY_PICKS } from '../data/picks'
import { formatDistance } from '../geo'
import { fetchOsrmTrip } from '../osrm'
import { formatTotalMinutes, formatWon, makeLeg, makeLegFromRoad, orderByRoute, type RouteLeg } from '../route'
import { parseKnownSaving } from '../utils'
import { useOrigin } from '../useOrigin'
import { PickItinerary, PickRouteMap } from '../components/PickRoute'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'

export function PickPage() {
  const { id = '' } = useParams()
  const story = WEEKLY_PICKS.find((item) => item.id === id)
  const { origin, located, locating, error, locate } = useOrigin()
  const [selected, setSelected] = useState<string | null>(null)
  const [road, setRoad] = useState<{ key: string; path: [number, number][]; legs: RouteLeg[] } | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)

  const stops = useMemo(() => {
    if (!story) return []
    const partners = BENEFITS.filter((benefit) => story.partnerIds.includes(benefit.id) && PARTNER_GEO[benefit.id])
    return orderByRoute(partners, origin, PARTNER_GEO)
  }, [origin, story])

  const tripKey = `${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}|${stops.map((stop) => stop.id).join(',')}`
  const live = road?.key === tripKey ? road : null
  const fallbackFirst = stops[0] ? makeLeg(origin, PARTNER_GEO[stops[0].id]) : null
  const fallbackLegs = stops.slice(1).map((stop, i) => makeLeg(PARTNER_GEO[stops[i].id], PARTNER_GEO[stop.id]))
  const firstLeg = live?.legs[0] ?? fallbackFirst
  const legs = live?.legs.slice(1) ?? fallbackLegs
  const allLegs = firstLeg ? [firstLeg, ...legs] : []
  const mapPath =
    live?.path ??
    (stops.length > 0
      ? ([origin, ...stops.map((stop) => PARTNER_GEO[stop.id])].map((point) => [
          point.lat,
          point.lng,
        ]) as [number, number][])
      : undefined)

  useEffect(() => {
    if (stops.length === 0) return
    const ac = new AbortController()
    const key = tripKey
    const points = [origin, ...stops.map((stop) => PARTNER_GEO[stop.id])]
    void fetchOsrmTrip(points, ac.signal)
      .then((trip) => {
        if (ac.signal.aborted) return
        if (!trip) {
          setFailedKey(key)
          return
        }
        setRoad({
          key,
          path: trip.path,
          legs: trip.legs.map((leg) => makeLegFromRoad(leg.meters, leg.durationSec, leg.profile)),
        })
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setFailedKey(key)
      })
    return () => ac.abort()
  }, [origin, stops, tripKey])
  const totalMeters = allLegs.reduce((sum, leg) => sum + leg.meters, 0)
  const totalMinutes = allLegs.reduce((sum, leg) => sum + leg.minutes, 0)
  const totalTaxi = allLegs.reduce((sum, leg) => sum + leg.taxiWon, 0)
  const visitBills = stops
    .map((stop) => parseKnownSaving(stop.discount))
    .filter((item): item is NonNullable<typeof item> => item !== null)
  const visitPay = visitBills.reduce((sum, item) => sum + (item.bill - item.saving), 0)
  const visitSave = visitBills.reduce((sum, item) => sum + item.saving, 0)
  const activeId = stops.some((item) => item.id === selected) ? selected : (stops[0]?.id ?? null)

  if (!story) {
    return (
      <main className="px-4 py-16 text-center">
        <p>추천을 찾지 못했습니다.</p>
        <Link to="/pick" className="mt-4 inline-block font-bold text-main">
          목록으로
        </Link>
      </main>
    )
  }

  return (
    <>
      <PageHeader
        kicker="추천"
        title={story.title}
        desc={story.line}
        back={{ to: '/pick', label: '목록으로' }}
      />
      <main className="wrap py-6">
        <p className="text-[15px] leading-7 text-gray-600">
          가까운 곳부터 이어서 가는 동선입니다. 구간마다 거리·이동시간·예상 이동비를 함께 보여드립니다.
        </p>

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl">
              <img src={story.image} alt="" className="aspect-[16/9] w-full object-cover" />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{located ? '현재 위치에서 출발' : '양구읍에서 출발'}</p>
              <button
                type="button"
                onClick={() => void locate()}
                className="rounded-full bg-main-50 px-3 py-1.5 text-xs font-bold text-main"
              >
                {locating ? '찾는 중...' : located ? '내 위치' : '내 위치로'}
              </button>
            </div>
            {error ? <p className="mt-1 text-xs text-gray-500">{error} 양구읍을 기준으로 보여드립니다.</p> : null}

            <div className="mt-4">
              <PickRouteMap origin={origin} stops={stops} selectedId={activeId} onSelect={setSelected} path={mapPath} />
            </div>

            {stops.length > 0 ? (
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-main-50 px-3 py-4 text-center">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500">총 이동</p>
                  <p className="mt-1 text-sm font-extrabold">{formatDistance(totalMeters)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500">예상 시간</p>
                  <p className="mt-1 text-sm font-extrabold">{formatTotalMinutes(totalMinutes)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-500">예상 이동비</p>
                  <p className="mt-1 text-sm font-extrabold">{formatWon(totalTaxi)}</p>
                </div>
              </div>
            ) : null}
            {visitBills.length > 0 ? (
              <p className="mt-2 text-center text-xs text-gray-600">
                입장료 있는 곳 군민 결제 {formatWon(visitPay)}
                <span className="text-point"> · {formatWon(visitSave)} 절약</span>
              </p>
            ) : null}
            <p className="mt-2 text-center text-[11px] leading-5 text-gray-400">
              {live
                ? '이동 거리·시간은 실제 도로 경로(OSRM) 기준입니다.'
                : failedKey === tripKey
                  ? '도로 경로를 불러오지 못해 직선거리로 보여드립니다.'
                  : '도로 경로를 불러오는 중입니다. 직선거리로 먼저 보여드립니다.'}{' '}
              1.5km 이내는 도보로 보고 이동비 0원입니다. 예상 택시는 참고용이며 실제 요금과 다를 수 있습니다.
            </p>
          </div>

          <div>
            <p className="text-sm font-extrabold">추천 동선 {stops.length}곳</p>
            <PickItinerary
              originLabel={located ? '현재 위치' : '양구읍'}
              firstLeg={firstLeg}
              stops={stops}
              legs={legs}
              selectedId={activeId}
              onSelect={setSelected}
            />
            <div className="mt-2 grid gap-3">
              <Link
                to="/nearby?comma=1"
                className="flex items-center justify-between rounded-2xl bg-main-50 px-4 py-3 text-sm font-bold text-main"
              >
                {story.linger ? '이 근처 쉼표 매장 보기' : '제휴 지도에서 쉼표 매장 보기'}
                <Icon name="right" className="h-4 w-4" />
              </Link>
              <Link
                to="/yanggu"
                className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
              >
                오늘 기록 남기기
                <Icon name="right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
