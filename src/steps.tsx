import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { haversineMeters } from './geo'
import { Pedometer } from './pedometer'
import { localDateIso } from './utils'
import type { GeoPoint } from './types'

const KEY = 'yanggu-day-steps'
const METERS_PER_STEP = 0.72

type Store = Record<string, number>

export type StepSource = 'motion' | 'gps'

type MotionPermission = { requestPermission?: () => Promise<'granted' | 'denied'> }
type WakeLock = { release: () => Promise<void> }
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLock> } }

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

function useStepsState() {
  const date = localDateIso()
  const [steps, setSteps] = useState(() => loadDaySteps(date))
  const [pastSteps] = useState(() => loadPastSteps(date))
  const [walking, setWalking] = useState(false)
  const [walkSteps, setWalkSteps] = useState(0)
  const [source, setSource] = useState<StepSource | null>(null)
  const [error, setError] = useState('')
  const [paused, setPaused] = useState(false)
  const watchRef = useRef<number | null>(null)
  const lastRef = useRef<GeoPoint | null>(null)
  const motionRef = useRef<((e: DeviceMotionEvent) => void) | null>(null)
  const sawMotionRef = useRef(false)
  const wakeRef = useRef<WakeLock | null>(null)

  const add = useCallback(
    (n: number) => {
      if (n <= 0) return
      setSteps((prev) => {
        const value = prev + n
        saveDaySteps(date, value)
        return value
      })
      setWalkSteps((prev) => prev + n)
    },
    [date],
  )

  // 산책 중에는 화면이 꺼지지 않게 한다. 꺼지면 센서도 멈춘다.
  const keepAwake = useCallback(async () => {
    const lock = (navigator as WakeLockNavigator).wakeLock
    if (!lock || wakeRef.current) return
    try {
      wakeRef.current = await lock.request('screen')
    } catch {
      wakeRef.current = null
    }
  }, [])

  const releaseAwake = useCallback(() => {
    void wakeRef.current?.release().catch(() => {})
    wakeRef.current = null
  }, [])

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
    releaseAwake()
    setWalking(false)
    setPaused(false)
    setSource(null)
  }, [stopGps, stopMotion, releaseAwake])

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 기기는 걸음을 셀 수 없어요.')
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
        add(Math.round(meters / METERS_PER_STEP))
      },
      () => setError('위치를 가져오지 못했어요. 걸음은 지금까지 센 만큼만 남아요.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 },
    )
  }, [add])

  const startMotion = useCallback(() => {
    const pedometer = new Pedometer()
    sawMotionRef.current = false
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a?.x == null || a.y == null || a.z == null) return
      sawMotionRef.current = true
      add(pedometer.push(a.x, a.y, a.z, e.timeStamp))
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
  }, [add, startGps, stopMotion])

  const startWalk = useCallback(async () => {
    setError('')
    setPaused(false)
    setWalkSteps(0)
    setWalking(true)
    const allowed = await motionAllowed()
    void keepAwake()
    if (allowed) startMotion()
    else startGps()
  }, [keepAwake, startGps, startMotion])

  // 다른 앱으로 가거나 화면이 꺼지면 센서가 멈춘다. 돌아오면 다시 화면을 깨워 둔다.
  useEffect(() => {
    if (!walking) return
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wakeRef.current = null
        setPaused(true)
      } else {
        void keepAwake()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [walking, keepAwake])

  useEffect(() => () => stopWalk(), [stopWalk])

  return {
    steps: Math.round(steps),
    totalSteps: Math.round(pastSteps + steps),
    walking,
    walkSteps,
    paused,
    source,
    error,
    startWalk,
    stopWalk,
    addSteps: add,
  }
}

type StepsValue = ReturnType<typeof useStepsState>

const StepsContext = createContext<StepsValue | null>(null)

// 산책은 앱 전체에서 하나로 돌아서, 부스 QR 화면으로 넘어가도 계속 센다.
export function StepsProvider({ children }: { children: ReactNode }) {
  const state = useStepsState()
  return <StepsContext.Provider value={state}>{children}</StepsContext.Provider>
}

export function useDaySteps() {
  const ctx = useContext(StepsContext)
  if (!ctx) throw new Error('StepsProvider가 필요합니다.')
  return ctx
}
