import { Link } from 'react-router-dom'
import { PARTNER_GEO } from '../data/picks'
import { pointToPercent } from '../geo'
import { formatWon, type RouteLeg, type RouteStop, areaHint } from '../route'
import { mapUrl, parseKnownSaving, usageBadge } from '../utils'
import type { GeoPoint } from '../types'

function xy(point: GeoPoint) {
  const pos = pointToPercent(point)
  return { x: parseFloat(pos.left), y: parseFloat(pos.top) }
}

export function PickRouteMap({
  origin,
  stops,
  selectedId,
  onSelect,
}: {
  origin: GeoPoint
  stops: RouteStop[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const points = [xy(origin), ...stops.map((stop) => xy(PARTNER_GEO[stop.id]))]
  const path = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <div className="relative h-72 overflow-hidden rounded-2xl border border-main-100 bg-[linear-gradient(180deg,#dae5d2_0%,#ecf2e8_55%,#f7f3e8_100%)]">
      <p className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-main">
        추천 동선
      </p>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {points.length > 1 ? (
          <path
            d={path}
            fill="none"
            stroke="#447e1d"
            strokeWidth="1.2"
            strokeDasharray="2.4 1.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      <span
        className="absolute z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#3b82f6] shadow"
        style={pointToPercent(origin)}
        title="출발"
      />
      {stops.map((stop, i) => {
        const pos = pointToPercent(PARTNER_GEO[stop.id])
        const active = selectedId === stop.id
        return (
          <button
            key={stop.id}
            type="button"
            title={stop.title}
            onClick={() => onSelect(stop.id)}
            className={`absolute z-20 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[11px] font-extrabold text-white shadow ${
              active ? 'bg-point' : 'bg-main'
            }`}
            style={pos}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}

export function PickItinerary({
  originLabel,
  firstLeg,
  stops,
  legs,
  selectedId,
  onSelect,
}: {
  originLabel: string
  firstLeg: RouteLeg | null
  stops: RouteStop[]
  legs: RouteLeg[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ol className="mt-2">
      <li className="flex gap-3">
        <div className="flex w-16 shrink-0 flex-col items-center">
          <span className="mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3b82f6] shadow" />
          {stops.length > 0 ? <span className="w-px flex-1 bg-gray-200" /> : null}
        </div>
        <div className="flex-1 pb-2">
          <p className="text-sm font-extrabold">출발</p>
          <p className="text-xs text-gray-500">{originLabel}</p>
        </div>
      </li>

      {stops.map((stop, i) => {
        const inbound = i === 0 ? firstLeg : legs[i - 1]
        const known = parseKnownSaving(stop.discount)
        const active = selectedId === stop.id
        return (
          <li key={stop.id} className="flex gap-3">
            <div className="flex w-16 shrink-0 flex-col items-center">
              {inbound ? <LegMark leg={inbound} /> : null}
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-extrabold text-white ${
                  active ? 'bg-point' : 'bg-main'
                }`}
              >
                {i + 1}
              </span>
              {i < stops.length - 1 ? <span className="w-px flex-1 bg-gray-200" /> : <span className="h-2" />}
            </div>
            <div className="flex-1 pb-4">
              <button
                type="button"
                onClick={() => onSelect(stop.id)}
                className={`w-full rounded-2xl border p-4 text-left ${
                  active ? 'border-main bg-main-50/70' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{stop.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {stop.category} · {areaHint(stop.location)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] font-bold text-point">{usageBadge(stop)}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">{stop.discount}</p>
                {known ? (
                  <p className="mt-1 text-sm font-bold text-main">
                    군민 결제 {formatWon(known.bill - known.saving)}
                    <span className="ml-1 font-semibold text-point">({formatWon(known.saving)} 절약)</span>
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <a
                    href={mapUrl(stop.location)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-main px-3 py-1.5 text-xs font-bold text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    길찾기
                  </a>
                  <Link
                    to={`/benefits#${stop.id}`}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    혜택 상세
                  </Link>
                </div>
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function LegMark({ leg }: { leg: RouteLeg }) {
  return (
    <div className="flex flex-col items-center py-2 text-center">
      <span className="w-px h-2 bg-gray-200" />
      <p className="max-w-[4.5rem] py-1 text-[10px] leading-tight font-bold text-gray-500">
        {leg.distance}
        <br />
        {leg.byWalk ? `도보 ${leg.walk}` : `차량 ${leg.drive}`}
        <br />
        {leg.taxiWon > 0 ? formatWon(leg.taxiWon) : '0원'}
      </p>
      <span className="w-px h-2 bg-gray-200" />
    </div>
  )
}
