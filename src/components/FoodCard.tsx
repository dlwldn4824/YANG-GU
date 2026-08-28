import { Link } from 'react-router-dom'
import type { FoodPlace } from '../types'
import { mapUrl } from '../utils'
import { Icon } from './Icon'

export function FoodCard({
  place,
  selected,
  distance,
  onSelect,
}: {
  place: FoodPlace
  selected?: boolean
  distance?: string
  onSelect?: (id: string) => void
}) {
  return (
    <article
      id={place.id}
      className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white ${
        selected ? 'border-main shadow-[0_8px_24px_rgba(34,70,16,0.08)]' : 'border-gray-100'
      }`}
    >
      <button type="button" className="flex w-full gap-3 p-3 text-left" onClick={() => onSelect?.(place.id)}>
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-main-50">
          {place.image ? (
            <img src={place.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-main">
              <Icon name="store" className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-extrabold leading-snug">{place.title}</h3>
            {distance ? <p className="shrink-0 text-xs font-bold text-main">{distance}</p> : null}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="rounded-full bg-main-50 px-2 py-0.5 text-main">{place.kind}</span>
            {place.region ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{place.region}</span> : null}
            {place.benefitId ? <span className="rounded-full bg-point px-2 py-0.5 text-white">군민 혜택</span> : null}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{place.address}</p>
          {place.phone ? <p className="mt-1 text-xs text-gray-500">{place.phone}</p> : null}
        </div>
      </button>
      <div className="flex flex-wrap gap-2 border-t border-gray-50 px-3 py-2.5">
        <a
          href={place.link}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-main-100 px-3 py-1.5 text-xs font-semibold text-main hover:bg-main-50"
        >
          양구볼구양
        </a>
        <a
          href={mapUrl(place.address)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          길찾기
        </a>
        {place.phone ? (
          <a href={`tel:${place.phone}`} className="rounded-full bg-main px-3 py-1.5 text-xs font-semibold text-white">
            {place.phone}
          </a>
        ) : null}
        {place.benefitId ? (
          <Link
            to={`/benefits#${place.benefitId}`}
            className="rounded-full border border-point/30 px-3 py-1.5 text-xs font-semibold text-point"
          >
            혜택 보기
          </Link>
        ) : null}
      </div>
    </article>
  )
}
