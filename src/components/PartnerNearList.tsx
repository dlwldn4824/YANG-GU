import { Link } from 'react-router-dom'
import { SHOW_COMMA } from '../data/picks'
import { mapUrl, parseKnownSaving } from '../utils'
import { formatDistance, formatWalkMinutes } from '../geo'
import type { Benefit } from '../types'

export type NearPartner = Benefit & { meters: number; comma?: boolean; stayPerk?: string }

export function PartnerNearList({
  items,
  selectedId,
  onSelect,
}: {
  items: NearPartner[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const known = parseKnownSaving(item.discount)
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-2xl border p-4 text-left ${
                selectedId === item.id ? 'border-main bg-main-50/60' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-extrabold">{item.title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-sub">
                    {item.category}
                    {SHOW_COMMA && item.comma ? <span className="ml-1.5 text-point">쉼표 지원</span> : null}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-main">{formatDistance(item.meters)}</p>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.discount}</p>
              {SHOW_COMMA && item.comma && item.stayPerk ? (
                <p className="mt-1 text-sm font-semibold text-point">{item.stayPerk}</p>
              ) : null}
              <p className="mt-1 text-xs text-gray-500">현재 위치에서 도보 약 {formatWalkMinutes(item.meters)}</p>
              {known ? (
                <p className="mt-2 text-sm font-bold text-point">
                  예상 결제 {known.bill.toLocaleString('ko-KR')}원 → 약 {known.saving.toLocaleString('ko-KR')}원 절약
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <a
                  href={mapUrl(item.location)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-main px-3 py-1.5 text-xs font-bold text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  길찾기
                </a>
                <Link
                  to={`/benefits#${item.id}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  혜택 상세
                </Link>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
