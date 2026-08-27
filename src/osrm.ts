import { WALK_OK_METERS, haversineMeters } from './geo'
import type { GeoPoint } from './types'

export type OsrmLeg = {
  meters: number
  durationSec: number
  profile: 'foot' | 'driving'
}

export type OsrmTrip = {
  path: [number, number][]
  legs: OsrmLeg[]
}

export async function fetchOsrmTrip(points: GeoPoint[], signal?: AbortSignal): Promise<OsrmTrip | null> {
  if (points.length < 2) return null
  const segments = await Promise.all(
    points.slice(1).map((to, i) => {
      const from = points[i]
      const profile: 'foot' | 'driving' = haversineMeters(from, to) < WALK_OK_METERS ? 'foot' : 'driving'
      return fetchOsrmSegment(from, to, profile, signal)
    }),
  )
  if (segments.some((item) => !item)) return null
  const path: [number, number][] = []
  const legs: OsrmLeg[] = []
  for (const segment of segments) {
    if (!segment) return null
    if (path.length > 0) path.pop()
    path.push(...segment.path)
    legs.push({ meters: segment.meters, durationSec: segment.durationSec, profile: segment.profile })
  }
  return { path, legs }
}

async function fetchOsrmSegment(
  from: GeoPoint,
  to: GeoPoint,
  profile: 'foot' | 'driving',
  signal?: AbortSignal,
) {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const data = (await res.json()) as {
    code?: string
    routes?: {
      distance: number
      duration: number
      geometry?: { coordinates: [number, number][] }
    }[]
  }
  const route = data.routes?.[0]
  if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) return null
  return {
    profile,
    meters: route.distance,
    durationSec: route.duration,
    path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
  }
}
