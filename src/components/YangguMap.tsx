import { useEffect, useRef } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { divIcon, latLngBounds } from 'leaflet'
import type { GeoPoint } from '../types'
import 'leaflet/dist/leaflet.css'

export type MapPin = {
  id: string
  point: GeoPoint
  label: string
  number?: number
  tone?: 'comma' | 'partner' | 'food'
}

function Fit({ points, maxZoom }: { points: GeoPoint[]; maxZoom: number }) {
  const map = useMap()
  const serialized = points.map((point) => `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`).join('|')

  useEffect(() => {
    if (!serialized) return
    const parsed = serialized.split('|').map((item) => {
      const [lat, lng] = item.split(',')
      return [Number(lat), Number(lng)] as [number, number]
    })
    if (parsed.length === 1) {
      map.setView(parsed[0], Math.min(14, maxZoom))
      return
    }
    map.fitBounds(latLngBounds(parsed), { padding: [36, 36], maxZoom })
  }, [map, serialized, maxZoom])
  return null
}

function FocusPin({ point }: { point: GeoPoint | null }) {
  const map = useMap()
  const skip = useRef(true)
  const lat = point?.lat
  const lng = point?.lng
  useEffect(() => {
    if (lat == null || lng == null) return
    if (skip.current) {
      skip.current = false
      return
    }
    map.panTo([lat, lng])
  }, [map, lat, lng])
  return null
}

function originIcon() {
  return divIcon({
    className: 'yanggu-map-pin',
    html: '<span class="block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#3b82f6] shadow"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function stopIcon(label: string, active: boolean, tone?: 'comma' | 'partner' | 'food') {
  if (tone === 'food') {
    const size = active ? 16 : 10
    const ring = active ? 'box-shadow:0 0 0 2px #fff,0 0 0 4px #447e1d' : 'box-shadow:0 1px 3px rgba(0,0,0,.3)'
    return divIcon({
      className: 'yanggu-map-pin',
      html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:#447e1d;${ring}"></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }
  const bg = tone === 'comma' ? '#ff8953' : '#447e1d'
  const ring = active ? 'box-shadow:0 0 0 2px #fff,0 0 0 4px ' + bg : 'box-shadow:0 1px 4px rgba(0,0,0,.25)'
  const width = Math.max(28, label.length * 12 + 14)
  return divIcon({
    className: 'yanggu-map-pin',
    html: `<span style="background:${bg};${ring}" class="grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[11px] font-extrabold text-white">${label}</span>`,
    iconSize: [width, 28],
    iconAnchor: [width / 2, 14],
  })
}

export function YangguMap({
  origin,
  pins,
  selectedId,
  onSelect,
  path,
  badge = '양구',
  className = 'h-72 lg:h-[32rem]',
  fitOrigin = true,
  maxFitZoom = 15,
}: {
  origin: GeoPoint
  pins: MapPin[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  path?: [number, number][]
  badge?: string
  fitOrigin?: boolean
  maxFitZoom?: number
  className?: string
}) {
  const pinPoints = pins.map((pin) => pin.point)
  const points = fitOrigin ? [origin, ...pinPoints] : pinPoints.length > 0 ? pinPoints : [origin]
  const center: [number, number] = [origin.lat, origin.lng]
  const selected = pins.find((pin) => pin.id === selectedId)?.point ?? null

  return (
    <div>
      <div className={`relative overflow-hidden rounded-2xl border border-main-100 ${className}`}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          zoomControl={false}
          className="yanggu-leaflet h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />
          <Fit points={points} maxZoom={maxFitZoom} />
          <FocusPin point={selected} />
          {path && path.length > 1 ? (
            <Polyline
              positions={path}
              pathOptions={{ color: '#447e1d', weight: 4, dashArray: '8 8', opacity: 0.9 }}
            />
          ) : null}
          <Marker position={[origin.lat, origin.lng]} icon={originIcon()} title="출발" />
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.point.lat, pin.point.lng]}
              icon={stopIcon(
                pin.number != null ? String(pin.number) : pin.label,
                selectedId === pin.id,
                pin.tone,
              )}
              title={pin.label}
              eventHandlers={{
                click: () => onSelect?.(pin.id),
              }}
            />
          ))}
        </MapContainer>
        <p className="pointer-events-none absolute top-3 left-3 z-[400] rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-main">
          {badge}
        </p>
      </div>
      <p className="mt-1 text-[10px] text-gray-400">지도 © OpenStreetMap · 경로 OSRM</p>
    </div>
  )
}
