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
  return `${Math.max(1, Math.round(meters / 80))}분`
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
