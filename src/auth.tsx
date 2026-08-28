import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEMO_CITIZEN } from './data/demo'
import type { Citizen } from './types'

const KEY = 'yanggu-cyber-citizen'

function load(): Citizen | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Citizen) : DEMO_CITIZEN
  } catch {
    return DEMO_CITIZEN
  }
}

type AuthValue = {
  citizen: Citizen | null
  login: (email: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [citizen, setCitizen] = useState<Citizen | null>(() => load())

  const value = useMemo<AuthValue>(
    () => ({
      citizen,
      login: (email, password) => {
        const stored = load()
        if (!stored) return '등록된 군민증이 없습니다.'
        if (stored.email !== email || stored.password !== password) {
          return '이메일 또는 비밀번호가 올바르지 않습니다.'
        }
        setCitizen(stored)
        return null
      },
      logout: () => {
        setCitizen(null)
      },
    }),
    [citizen],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider가 필요합니다.')
  return ctx
}
