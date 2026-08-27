import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BENEFITS } from '../data'
import { COMMA_MOODS, COMMA_SPACES, PARTNER_GEO } from '../data/picks'
import { formatDistance, formatWalkMinutes, haversineMeters } from '../geo'
import { mapUrl } from '../utils'
import { useOrigin } from '../useOrigin'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import type { CommaMood } from '../types'

export function CommaPage() {
  const { origin, located, locating, error, locate } = useOrigin()
  const [mood, setMood] = useState<CommaMood | 'all'>('all')

  const spaces = useMemo(() => {
    return COMMA_SPACES.filter((space) => mood === 'all' || space.mood === mood)
      .map((space) => {
        const partner = BENEFITS.find((item) => item.id === space.partnerId)
        const geo = PARTNER_GEO[space.partnerId]
        const shop = space.sample ? BENEFITS.find((item) => item.id === space.sample?.shopId) : undefined
        const shopGeo = space.sample ? PARTNER_GEO[space.sample.shopId] : undefined
        if (!partner || !geo) return null
        return {
          ...space,
          partner,
          meters: haversineMeters(origin, geo),
          shop,
          shopMeters: shopGeo ? haversineMeters(origin, shopGeo) : undefined,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.meters - b.meters)
  }, [mood, origin])

  return (
    <>
      <PageHeader kicker="COMMA" title="군민 쉼표" desc="양구에서 서두르지 않아도 되는 이유" />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <section className="rounded-2xl bg-main-50 px-5 py-6">
          <p className="text-[11px] font-bold tracking-[0.18em] text-sub">TODAY</p>
          <h2 className="mt-2 text-xl font-extrabold">오늘은 양구에서 조금 천천히</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            지금 주변에 오래 머물기 좋은 군민 제휴 공간이 있어요. 걷거나 스탬프를 모으지 않아도 됩니다. 앉아 있는 시간이
            곧 양구를 발견하는 시간입니다.
          </p>
        </section>

        <div className="mt-5 flex items-center justify-between">
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

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          <MoodChip active={mood === 'all'} onClick={() => setMood('all')} label="전체" />
          {COMMA_MOODS.map((item) => (
            <MoodChip
              key={item.id}
              active={mood === item.id}
              onClick={() => setMood(item.id)}
              label={`${item.emoji} ${item.label}`}
            />
          ))}
        </div>

        <ul className="mt-5 space-y-4">
          {spaces.map((space) => (
            <li key={space.partnerId} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {space.partner.image ? (
                <img src={space.partner.image} alt="" className="aspect-[16/9] w-full object-cover" />
              ) : null}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-sub">군민 쉼표 매장</p>
                    <h3 className="mt-1 text-lg font-extrabold">{space.partner.title}</h3>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-main">{formatDistance(space.meters)}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">{space.vibe}</p>
                <p className="mt-3 rounded-xl bg-main-50 px-3 py-2 text-sm font-semibold text-main">{space.stayPerk}</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={mapUrl(space.partner.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-main px-3 py-1.5 text-xs font-bold text-white"
                  >
                    길찾기
                  </a>
                  <Link
                    to={`/benefits#${space.partner.id}`}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600"
                  >
                    군민 혜택
                  </Link>
                </div>

                {space.sample && space.shop && space.shopMeters !== undefined ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-main-200 p-4">
                    <p className="text-sm font-extrabold">
                      {space.sample.emoji} {space.sample.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{space.sample.line}</p>
                    <p className="mt-3 text-sm font-bold">맛있는데? 이거 어디서 사요?</p>
                    <p className="mt-1 text-sm text-gray-600">
                      현재 위치에서 {formatWalkMinutes(space.shopMeters)} 거리에 판매점
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {space.shop.title} · {space.shop.discount}
                    </p>
                    <Link
                      to={space.shop.id === 'farm' ? '/pick/season' : `/benefits#${space.shop.id}`}
                      className="mt-3 inline-flex items-center text-sm font-bold text-main"
                    >
                      군민증으로 사가기 <Icon name="right" className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <Link
          to="/card#yanggu"
          className="mt-8 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white"
        >
          쉬었다면, 오늘의 양구를 한 장 남기기
          <Icon name="right" className="h-4 w-4" />
        </Link>
      </main>
    </>
  )
}

function MoodChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
        active ? 'bg-main text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}
