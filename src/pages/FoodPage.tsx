import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FoodCard } from '../components/FoodCard'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { YangguMap } from '../components/YangguMap'
import { FOOD_KINDS, FOOD_PLACES, FOOD_REGIONS } from '../data/food'
import { formatDistance, haversineMeters } from '../geo'
import { useOrigin } from '../useOrigin'
import type { FoodRegion } from '../types'

const PAGE = 24

export function FoodPage() {
  const location = useLocation()
  const { origin, located, locating, error, locate } = useOrigin()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<(typeof FOOD_KINDS)[number]>('전체')
  const [region, setRegion] = useState<FoodRegion | '전체'>('전체')
  const [selected, setSelected] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE)

  const list = useMemo(() => {
    const q = query.trim()
    return FOOD_PLACES.filter((place) => {
      const matchKind = kind === '전체' || place.kind === kind
      const matchRegion = region === '전체' || place.region === region
      const matchQ =
        !q ||
        place.title.includes(q) ||
        place.address.includes(q) ||
        (place.cuisine?.includes(q) ?? false) ||
        place.tags.some((tag) => tag.includes(q))
      return matchKind && matchRegion && matchQ
    })
      .map((place) => ({
        ...place,
        meters: place.point ? haversineMeters(origin, place.point) : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => a.meters - b.meters)
  }, [kind, origin, query, region])

  const activeId = list.some((item) => item.id === selected) ? selected : null

  function pick(id: string, scroll = false) {
    setSelected(id)
    const index = list.findIndex((item) => item.id === id)
    if (index >= 0) setVisible((n) => Math.max(n, index + 1))
    if (!scroll) return
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  useEffect(() => {
    setVisible(PAGE)
  }, [kind, query, region])

  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (!id) return
    setSelected(id)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  useEffect(() => {
    if (!activeId) return
    const index = list.findIndex((item) => item.id === activeId)
    if (index >= 0) setVisible((n) => Math.max(n, index + 1))
  }, [activeId, list])

  const shown = list.slice(0, visible)
  const pins = shown.flatMap((item) =>
    item.point ? [{ id: item.id, point: item.point, label: item.title, tone: 'food' as const }] : [],
  )

  return (
    <>
      <PageHeader
        kicker="먹고잘구양"
        title="양구 음식점"
        desc="양구볼구양에 등록된 음식점입니다. 군민 할인과는 별개이며, 제휴점은 군민 혜택으로 표시합니다."
      />
      <main className="wrap py-6">
        <div className="mb-4">
          <Link to="/benefits" className="inline-flex items-center gap-1 text-sm font-bold text-main">
            군민 할인 제휴점은 혜택에서 보기
            <Icon name="right" className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mb-3">
          <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="가게, 메뉴, 주소로 검색"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-main"
          />
        </div>

        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {FOOD_KINDS.map((item) => (
            <Chip key={item} active={kind === item} label={item} onClick={() => setKind(item)} />
          ))}
        </div>
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <Chip active={region === '전체'} label="전체 지역" onClick={() => setRegion('전체')} />
          {FOOD_REGIONS.map((item) => (
            <Chip key={item} active={region === item} label={item} onClick={() => setRegion(item)} />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-600">
            총 {list.length}곳
            {located && list[0]?.point ? ` · 가까운 곳 ${formatDistance(list[0].meters)}` : ''}
          </p>
          <button type="button" onClick={() => void locate()} className="rounded-full bg-main-50 px-3 py-1.5 text-xs font-bold text-main">
            {locating ? '찾는 중...' : located ? '위치 다시' : '내 위치로'}
          </button>
        </div>
        {error ? <p className="mb-3 text-xs text-gray-500">{error} 양구읍을 기준으로 보여드립니다.</p> : null}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(22rem,1fr)]">
          <div className="lg:sticky lg:top-20">
            <YangguMap
              origin={origin}
              pins={pins}
              selectedId={activeId}
              onSelect={(id) => pick(id, true)}
              badge="음식점"
              fitOrigin={false}
              maxFitZoom={12}
              className="h-72 lg:h-[min(70vh,40rem)]"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              지도는 목록 {shown.length}곳을 보여 드립니다. 더 보기를 누르면 핀이 늘어납니다.
            </p>
          </div>
          <div>
            {list.length === 0 ? (
              <p className="py-16 text-center text-gray-500">조건에 맞는 음식점이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {shown.map((place) => (
                  <li key={place.id}>
                    <FoodCard
                      place={place}
                      selected={place.id === activeId}
                      distance={place.point ? formatDistance(place.meters) : undefined}
                      onSelect={(id) => pick(id)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {visible < list.length ? (
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE)}
                className="mt-5 w-full rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                더 보기 ({list.length - visible}곳)
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          자료: 양구군 공식 관광 사이트{' '}
          <a href="https://www.ygtour.kr/Home/H40000/H40200/placeList?curationGroup=3&place_class=P008&viewClass=food" className="font-semibold text-main">
            양구볼구양 먹고잘구양
          </a>
        </p>
      </main>
    </>
  )
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${active ? 'bg-main text-white' : 'bg-gray-100 text-gray-600'}`}
    >
      {label}
    </button>
  )
}
