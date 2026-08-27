import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BENEFITS } from '../data'
import { PARTNER_GEO, WEEKLY_PICKS } from '../data/picks'
import { formatDistance, haversineMeters } from '../geo'
import { useOrigin } from '../useOrigin'
import { PartnerNearList } from '../components/PartnerNearList'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'

export function PickPage() {
  const { id = '' } = useParams()
  const story = WEEKLY_PICKS.find((item) => item.id === id)
  const { origin, located, locating, error, locate } = useOrigin()
  const [selected, setSelected] = useState<string | null>(null)

  const items = useMemo(() => {
    if (!story) return []
    return BENEFITS.filter((benefit) => story.partnerIds.includes(benefit.id) && PARTNER_GEO[benefit.id])
      .map((benefit) => ({
        ...benefit,
        meters: haversineMeters(origin, PARTNER_GEO[benefit.id]),
      }))
      .sort((a, b) => a.meters - b.meters)
  }, [origin, story])

  const activeId = items.some((item) => item.id === selected) ? selected : (items[0]?.id ?? null)

  if (!story) {
    return (
      <main className="px-4 py-16 text-center">
        <p>이번 주 PICK을 찾지 못했습니다.</p>
        <Link to="/" className="mt-4 inline-block font-bold text-main">
          홈으로
        </Link>
      </main>
    )
  }

  return (
    <>
      <PageHeader kicker="EDITOR PICK" title={`${story.emoji} ${story.title}`} desc={story.line} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[11px] font-bold tracking-[0.18em] text-sub">{story.weekLabel}</p>
        <p className="mt-3 text-[15px] leading-7 text-gray-600">
          광고가 아니라, 이번 주 양구에서 실제로 해볼 만한 일을 골라 담았습니다. 관련 제휴점에서 군민 혜택을 받을 수
          있고 지금 위치에서 얼마나 가까운지도 함께 보여드립니다.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl">
          <img src={story.image} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm font-bold">
            군민증 혜택 받을 수 있는 곳 {items.length}곳
            {items[0] ? ` · 가장 가까운 곳 ${formatDistance(items[0].meters)}` : ''}
          </p>
          <button
            type="button"
            onClick={() => void locate()}
            className="rounded-full bg-main-50 px-3 py-1.5 text-xs font-bold text-main"
          >
            {locating ? '찾는 중...' : located ? '내 위치' : '내 위치로'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          📍 {located ? '현재 위치' : '양구읍 기준'}
          {error ? ` · ${error}` : ''}
        </p>

        <div className="mt-4">
          <PartnerNearList items={items} selectedId={activeId} onSelect={setSelected} />
        </div>

        <div className="mt-6 grid gap-3">
          {story.linger ? (
            <Link
              to="/comma"
              className="flex items-center justify-between rounded-2xl bg-main-50 px-4 py-3 text-sm font-bold text-main"
            >
              이 근처에서 천천히 쉬기
              <Icon name="right" className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/comma"
              className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
            >
              사기 전에, 양구에서 조금 머물러도 좋아요
              <Icon name="right" className="h-4 w-4" />
            </Link>
          )}
          <Link
            to="/card#yanggu"
            className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
          >
            오늘의 양구를 한 장 남기기
            <Icon name="right" className="h-4 w-4" />
          </Link>
          <Link to={`/nearby?pick=${story.id}`} className="text-center text-sm font-bold text-main">
            지도에서 보기
          </Link>
        </div>
      </main>
    </>
  )
}
