import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_FRAGMENTS } from './data/demo'
import type { YangguFragment } from './types'
import { localDateIso } from './utils'

const KEY = 'yanggu-fragments'

function load(): YangguFragment[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as YangguFragment[]) : []
    return parsed.length > 0 ? parsed : DEMO_FRAGMENTS
  } catch {
    return DEMO_FRAGMENTS
  }
}

function persist(items: YangguFragment[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 24)))
}

type JournalValue = {
  fragments: YangguFragment[]
  addFragment: (item: YangguFragment) => void
}

const JournalContext = createContext<JournalValue | null>(null)

export function JournalProvider({ children }: { children: ReactNode }) {
  const [fragments, setFragments] = useState<YangguFragment[]>(() => load())

  const value = useMemo<JournalValue>(
    () => ({
      fragments,
      addFragment: (item) => {
        setFragments((prev) => {
          const next = [item, ...prev].slice(0, 24)
          persist(next)
          return next
        })
      },
    }),
    [fragments],
  )

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

export function useJournal() {
  const ctx = useContext(JournalContext)
  if (!ctx) throw new Error('JournalProvider가 필요합니다.')
  return ctx
}

export function uniqueKinds(fragments: YangguFragment[]) {
  const seen = new Set<string>()
  return fragments.filter((item) => {
    if (seen.has(item.kind)) return false
    seen.add(item.kind)
    return true
  })
}

export function todayFragments(fragments: YangguFragment[]) {
  const today = localDateIso()
  return fragments.filter((item) => item.date === today)
}

export function visitMonths(fragments: YangguFragment[]) {
  const map = new Map<string, YangguFragment[]>()
  for (const item of fragments) {
    const key = item.date.slice(0, 7)
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export function visitDays(fragments: YangguFragment[]) {
  return new Set(fragments.map((item) => item.date)).size
}

export function daySpan(fragments: YangguFragment[]) {
  if (fragments.length === 0) return 0
  const times = fragments.map((item) => new Date(item.capturedAt).getTime())
  return Math.max(...times) - Math.min(...times)
}
