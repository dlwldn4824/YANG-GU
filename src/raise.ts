import { useCallback, useState } from 'react'
import { localDateIso } from './utils'

const KEY = 'yanggu-baekkobi-care'
const VISIT_KEY = 'yanggu-baekkobi-visits'
const SEEN_KEY = 'yanggu-baekkobi-seen-level'

// 경험치는 걷기와 부스 방문으로만 쌓인다. 먹이는 부스 QR을 찍어야 생기고,
// 쓰다듬기는 기분만 올려서 버튼 연타로 랭킹을 올릴 수 없다.
export const XP = {
  step: 1,
  visit: 300,
  feed: 100,
} as const

export const FEED_PER_VISIT = 1
export const PET_LIMIT = 5

type DayCare = { fed: number; petted: number }
type CareStore = Record<string, DayCare>
// 부스 id → QR을 찍은 날짜들
type VisitStore = Record<string, string[]>

function readJson<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T) ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장이 막힌 브라우저에서는 지금 화면에서만 유지된다.
  }
}

function loadCare(): CareStore {
  const raw = readJson<Record<string, unknown>>(KEY, {})
  // 예전에는 오늘 하루치만 { date, fed, petted } 로 저장했다.
  if (typeof raw.date === 'string') {
    return { [raw.date]: { fed: Number(raw.fed) || 0, petted: Number(raw.petted) || 0 } }
  }
  return raw as CareStore
}

function loadVisits(): VisitStore {
  return readJson<VisitStore>(VISIT_KEY, {})
}

export const GROWTH = [
  { level: 1, name: '아기 배꼬비', need: 0, src: '/assets/baekkobi-lv1.png' },
  { level: 2, name: '호기심 많은 배꼬비', need: 1000, src: '/assets/baekkobi-lv2.png' },
  { level: 3, name: '든든한 배꼬비', need: 3000, src: '/assets/baekkobi-lv3.png' },
  { level: 4, name: '양구 탐험가 배꼬비', need: 6000, src: '/assets/baekkobi-lv4.png' },
  { level: 5, name: '양구 고수 배꼬비', need: 10000, src: '/assets/baekkobi-lv5.png' },
] as const

export type Growth = ReturnType<typeof growthFromXp>

export function growthFromXp(xp: number) {
  let index = 0
  for (let i = 0; i < GROWTH.length; i++) {
    if (xp >= GROWTH[i].need) index = i
  }
  const current = GROWTH[index]
  const next = GROWTH[index + 1] ?? current
  const maxed = current === next
  const span = Math.max(1, next.need - current.need)
  const into = Math.min(span, Math.max(0, xp - current.need))
  return {
    ...current,
    xp,
    nextNeed: next.need,
    toNext: maxed ? 0 : next.need - xp,
    progress: maxed ? 1 : into / span,
    maxed,
  }
}

// 아직 이미지가 없는 레벨은 그 아래 레벨 이미지로 대신 보여준다.
export function growthSources(level: number) {
  return GROWTH.filter((item) => item.level <= level)
    .map((item) => item.src as string)
    .reverse()
    .concat('/assets/baekkobi.png')
}

export type VisitResult = 'new' | 'again'

export function useBaekkobi(totalSteps: number) {
  const date = localDateIso()
  const [care, setCare] = useState<CareStore>(loadCare)
  const [visits, setVisits] = useState<VisitStore>(loadVisits)
  const [seenLevel, setSeenLevel] = useState(() => readJson<number>(SEEN_KEY, 1))

  const today = care[date] ?? { fed: 0, petted: 0 }
  const visitCount = Object.values(visits).reduce((sum, days) => sum + days.length, 0)
  // 예전에는 먹이를 그냥 줄 수 있었으니, 부스에서 받은 만큼만 경험치로 친다.
  const earned = visitCount * FEED_PER_VISIT
  const totalFed = Math.min(earned, Object.values(care).reduce((sum, day) => sum + day.fed, 0))
  // 부스에서 받은 먹이 중 아직 안 준 것
  const snacks = earned - totalFed

  const updateToday = useCallback(
    (change: (day: DayCare) => DayCare) => {
      setCare((prev) => {
        const next = { ...prev, [date]: change(prev[date] ?? { fed: 0, petted: 0 }) }
        writeJson(KEY, next)
        return next
      })
    },
    [date],
  )

  const feed = useCallback(
    () => {
      if (snacks > 0) updateToday((day) => ({ ...day, fed: day.fed + 1 }))
    },
    [snacks, updateToday],
  )
  const pet = useCallback(
    () => updateToday((day) => ({ ...day, petted: Math.min(PET_LIMIT, day.petted + 1) })),
    [updateToday],
  )

  // 같은 부스는 하루에 한 번만 경험치를 준다.
  const recordVisit = useCallback(
    (boothId: string): VisitResult => {
      const stored = loadVisits()
      const days = stored[boothId] ?? []
      if (days.includes(date)) {
        setVisits(stored)
        return 'again'
      }
      const next = { ...stored, [boothId]: [...days, date] }
      writeJson(VISIT_KEY, next)
      setVisits(next)
      return 'new'
    },
    [date],
  )

  const xp = Math.round(totalSteps) * XP.step + visitCount * XP.visit + totalFed * XP.feed
  const growth = growthFromXp(xp)
  const levelUp = growth.level > seenLevel ? growth : null

  const ackLevelUp = useCallback(() => {
    setSeenLevel(growth.level)
    writeJson(SEEN_KEY, growth.level)
  }, [growth.level])

  return {
    growth,
    fed: today.fed,
    snacks,
    petted: today.petted,
    feed,
    pet,
    visitCount,
    visitedToday: Object.keys(visits).filter((id) => visits[id].includes(date)),
    recordVisit,
    levelUp,
    ackLevelUp,
  }
}
