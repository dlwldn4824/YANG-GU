import {
  driveMinutes,
  estimateTaxiWon,
  formatDistance,
  formatDriveMinutes,
  formatWalkMinutes,
  haversineMeters,
  walkMinutes,
  WALK_OK_METERS,
} from './geo'
import type { Benefit, GeoPoint } from './types'

export type RouteStop = Benefit & { metersFromOrigin: number }

export type RouteLeg = {
  meters: number
  distance: string
  walk: string
  drive: string
  minutes: number
  taxiWon: number
  byWalk: boolean
}

export function orderByRoute(items: Benefit[], origin: GeoPoint, geo: Record<string, GeoPoint>): RouteStop[] {
  const remaining = items.filter((item) => geo[item.id])
  const ordered: RouteStop[] = []
  let current = origin
  while (remaining.length > 0) {
    let best = 0
    let bestMeters = Number.POSITIVE_INFINITY
    remaining.forEach((item, index) => {
      const meters = haversineMeters(current, geo[item.id])
      if (meters < bestMeters) {
        bestMeters = meters
        best = index
      }
    })
    const next = remaining.splice(best, 1)[0]
    ordered.push({
      ...next,
      metersFromOrigin: haversineMeters(origin, geo[next.id]),
    })
    current = geo[next.id]
  }
  return ordered
}

export function makeLeg(from: GeoPoint, to: GeoPoint): RouteLeg {
  const meters = haversineMeters(from, to)
  const byWalk = meters < WALK_OK_METERS
  return {
    meters,
    distance: formatDistance(meters),
    walk: formatWalkMinutes(meters),
    drive: formatDriveMinutes(meters),
    minutes: byWalk ? walkMinutes(meters) : driveMinutes(meters),
    taxiWon: estimateTaxiWon(meters),
    byWalk,
  }
}

export function formatWon(won: number) {
  return `${won.toLocaleString('ko-KR')}원`
}

export function formatTotalMinutes(minutes: number) {
  if (minutes < 60) return `약 ${minutes}분`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `약 ${hours}시간 ${rest}분` : `약 ${hours}시간`
}

export function areaHint(location: string) {
  if (location.includes('해안면')) return '해안면'
  if (location.includes('동면')) return '동면'
  if (location.includes('방산면')) return '방산면'
  if (location.includes('국토정중앙면')) return '국토정중앙면'
  return '양구읍'
}
