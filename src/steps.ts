import { useCallback, useEffect, useRef, useState } from 'react'
import { haversineMeters } from './geo'
import { localDateIso } from './utils'
import type { GeoPoint } from './types'

const KEY = 'yanggu-day-steps'
const METERS_PER_STEP = 0.72

type Store = Record<string, number>

function readStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
  } catch {
    return {}
  }
}

function writeStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function loadDaySteps(date = localDateIso()) {
  return readStore()[date] ?? 0
}

export function saveDaySteps(date: string, steps: number) {
  const store = readStore()
  store[date] = Math.max(0, Math.round(steps))
  writeStore(store)
}

export function useDaySteps() {
  const date = localDateIso()
  const [steps, setSteps] = useState(() => loadDaySteps(date))
  const [walking, setWalking] = useState(false)
  const [error, setError] = useState('')
  const watchRef = useRef<number | null>(null)
  const lastRef = useRef<GeoPoint | null>(null)

  const setAndSave = useCallback(
    (next: number | ((prev: number) => number)) => {
      setSteps((prev) => {
        const value = typeof next === 'function' ? next(prev) : next
        saveDaySteps(date, value)
        return value
      })
    },
    [date],
  )

  const stopWalk = useCallback(() => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    lastRef.current = null
    setWalking(false)
  }, [])

  const startWalk = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 걷기를 기록할 수 없습니다.')
      return
    }
    setError('')
    setWalking(true)
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const prev = lastRef.current
        lastRef.current = point
        if (!prev) return
        const meters = haversineMeters(prev, point)
        if (meters < 4 || meters > 80) return
        setAndSave((n) => n + meters / METERS_PER_STEP)
      },
      () => setError('위치를 가져오지 못했습니다. 걸음은 지금까지 기록된 만큼만 남습니다.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 },
    )
  }, [setAndSave])

  useEffect(() => () => stopWalk(), [stopWalk])

  return {
    steps: Math.round(steps),
    walking,
    error,
    startWalk,
    stopWalk,
  }
}
