import { Link } from 'react-router-dom'
import { PARTNER_GEO } from '../data/picks'
import { formatWon, type RouteLeg, type RouteStop, areaHint } from '../route'
import { mapUrl, parseKnownSaving, usageBadge } from '../utils'
import type { GeoPoint } from '../types'
import { YangguMap } from './YangguMap'

export function PickRouteMap({
  origin,
  stops,
  selectedId,
  onSelect,
  path,
}: {
  origin: GeoPoint
  stops: RouteStop[]
  selectedId: string | null
  onSelect: (id: string) => void
  path?: [number, number][]
}) {
  return (
    <YangguMap
      origin={origin}
      pins={stops.map((stop, i) => ({
        id: stop.id,
        point: PARTNER_GEO[stop.id],
        label: stop.title,
        number: i + 1,
      }))}
      selectedId={selectedId}
      onSelect={onSelect}
      path={path}
      badge="추천 동선"
    />
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
                    <p className="font-display font-extrabold">{stop.title}</p>
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
