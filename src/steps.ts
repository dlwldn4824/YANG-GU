import { useCallback, useEffect, useRef, useState } from 'react'
import { haversineMeters } from './geo'
import { localDateIso } from './utils'
import type { GeoPoint } from './types'

const KEY = 'yanggu-day-steps'
const METERS_PER_STEP = 0.72
// 가속도 크기가 이 값을 넘었다가 내려오면 한 걸음으로 센다 (m/s²).
const STEP_PEAK = 11.2
const STEP_GAP_MS = 280

type Store = Record<string, number>

export type StepSource = 'motion' | 'gps'

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }

function readStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
  } catch {
    return {}
  }
}

function writeStore(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // 저장이 막힌 브라우저에서는 지금 화면에서만 유지된다.
  }
}

export function loadDaySteps(date = localDateIso()) {
  return readStore()[date] ?? 0
}

export function saveDaySteps(date: string, steps: number) {
  const store = readStore()
  store[date] = Math.max(0, Math.round(steps))
  writeStore(store)
}

// 오늘을 뺀 지난 날들의 걸음 합계
export function loadPastSteps(today = localDateIso()) {
  return Object.entries(readStore()).reduce((sum, [date, steps]) => (date === today ? sum : sum + steps), 0)
}

// iOS 사파리는 버튼을 누른 순간에만 동작 센서 권한을 물어볼 수 있다.
async function motionAllowed() {
  if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return false
  const ask = (DeviceMotionEvent as unknown as MotionPermission).requestPermission
  if (!ask) return true
  try {
    return (await ask()) === 'granted'
  } catch {
    return false
  }
}

export function useDaySteps() {
  const date = localDateIso()
  const [steps, setSteps] = useState(() => loadDaySteps(date))
  const [pastSteps] = useState(() => loadPastSteps(date))
  const [walking, setWalking] = useState(false)
  const [source, setSource] = useState<StepSource | null>(null)
  const [error, setError] = useState('')
  const watchRef = useRef<number | null>(null)
  const lastRef = useRef<GeoPoint | null>(null)
  const motionRef = useRef<((e: DeviceMotionEvent) => void) | null>(null)
  const sawMotionRef = useRef(false)

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

  const stopGps = useCallback(() => {
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
    lastRef.current = null
  }, [])

  const stopMotion = useCallback(() => {
    if (motionRef.current) {
      window.removeEventListener('devicemotion', motionRef.current)
      motionRef.current = null
    }
  }, [])

  const stopWalk = useCallback(() => {
    stopGps()
    stopMotion()
    setWalking(false)
    setSource(null)
  }, [stopGps, stopMotion])

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 걷기를 기록할 수 없습니다.')
      setWalking(false)
      return
    }
    setSource('gps')
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

  const startMotion = useCallback(() => {
    let smooth = 9.8
    let above = false
    let lastStep = 0
    sawMotionRef.current = false
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a?.x == null || a.y == null || a.z == null) return
      sawMotionRef.current = true
      smooth = smooth * 0.75 + Math.hypot(a.x, a.y, a.z) * 0.25
      if (!above && smooth > STEP_PEAK) {
        above = true
        const now = e.timeStamp
        if (now - lastStep > STEP_GAP_MS) {
          lastStep = now
          setAndSave((n) => n + 1)
        }
      } else if (above && smooth < 10.2) {
        above = false
      }
    }
    motionRef.current = onMotion
    window.addEventListener('devicemotion', onMotion)
    setSource('motion')
    // 센서 값이 안 들어오는 기기(데스크톱 등)는 위치로 센다.
    window.setTimeout(() => {
      if (motionRef.current === onMotion && !sawMotionRef.current) {
        stopMotion()
        startGps()
      }
    }, 2500)
  }, [setAndSave, startGps, stopMotion])

  const startWalk = useCallback(async () => {
    setError('')
    setWalking(true)
    if (await motionAllowed()) startMotion()
    else startGps()
  }, [startGps, startMotion])

  const addSteps = useCallback((n: number) => setAndSave((prev) => prev + n), [setAndSave])

  useEffect(() => () => stopWalk(), [stopWalk])

  return {
    steps: Math.round(steps),
    totalSteps: Math.round(pastSteps + steps),
    walking,
    source,
    error,
    startWalk,
    stopWalk,
    addSteps,
  }
}
