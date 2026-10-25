import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth'

const ID_KEY = 'yanggu-ranker-id'

export type Ranker = { id: string; rank: number; name: string; level: number; xp: number }
export type MyRank = { rank: number; xp: number }

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 저장이 막힌 브라우저에서는 지금 화면에서만 유지된다.
  }
}

// 이 휴대폰의 번호. 처음 들어왔을 때 한 번 만들고, 랭킹과 방문 기록에 같이 쓴다.
export function rankerId() {
  const saved = read(ID_KEY)
  if (saved) return saved
  const id =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  write(ID_KEY, id)
  return id
}

// 로그인한 계정 이름으로 랭킹에 오른다. 점수는 서버가 로그인 토큰으로 누구 것인지 확인한다.
export function useRanking(xp: number, level: number) {
  const { citizen, token } = useAuth()
  const id = citizen?.id ?? ''
  const [top, setTop] = useState<Ranker[]>([])
  const [me, setMe] = useState<MyRank | null>(null)
  const [error, setError] = useState('')
  const joined = Boolean(id && token)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/rank?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { top: Ranker[]; me: MyRank | null }
      setTop(data.top)
      setMe(data.me)
      setError('')
    } catch {
      setError('랭킹을 불러오지 못했어요.')
    }
  }, [id])

  // 점수가 바뀌면 잠깐 기다렸다가 한 번에 올린다 (산책 중에는 걸음마다 바뀐다).
  useEffect(() => {
    if (!joined) {
      void refresh()
      return
    }
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/rank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ xp, level }),
        })
        if (!res.ok) throw new Error(String(res.status))
        await refresh()
      } catch {
        setError('랭킹에 점수를 올리지 못했어요.')
      }
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [joined, token, xp, level, refresh])

  return { id, name: citizen?.name ?? '', joined, top, me, error }
}
