import { YANGGU_BOUNDS } from './data/picks'
import type { GeoPoint } from './types'

export function haversineMeters(a: GeoPoint, b: GeoPoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export function formatWalkMinutes(meters: number) {
  return formatMinutes(Math.max(1, Math.round(meters / 80)))
}

/** 시내·군도 기준 시속 약 30km */
export function formatDriveMinutes(meters: number) {
  return formatMinutes(Math.max(1, Math.round(meters / 500)))
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}분`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`
}

export function walkMinutes(meters: number) {
  return Math.max(1, Math.round(meters / 80))
}

export function driveMinutes(meters: number) {
  return Math.max(1, Math.round(meters / 500))
}

/** 도보로 무리 없는 거리. 이내면 이동비 0원 */
export const WALK_OK_METERS = 1500

/**
 * 직선거리 기준 예상 택시.
 * 기본 4,000원(1.6km) + 130m당 100원. 공식 요금이 아니라 참고용이다.
 */
export function estimateTaxiWon(meters: number) {
  if (meters < WALK_OK_METERS) return 0
  const base = 4000
  const baseMeters = 1600
  if (meters <= baseMeters) return base
  return base + Math.ceil((meters - baseMeters) / 130) * 100
}

export function pointToPercent(point: GeoPoint) {
  const x = ((point.lng - YANGGU_BOUNDS.west) / (YANGGU_BOUNDS.east - YANGGU_BOUNDS.west)) * 100
  const y = ((YANGGU_BOUNDS.north - point.lat) / (YANGGU_BOUNDS.north - YANGGU_BOUNDS.south)) * 100
  return {
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(96, Math.max(4, y))}%`,
  }
}

export function getCurrentPosition(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치를 지원하지 않습니다.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('위치를 가져오지 못했습니다.')),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  })
}
