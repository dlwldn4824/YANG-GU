import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CardDesign, Citizen } from './types'

// 계정은 서버(/api/auth)에 있고, 휴대폰에는 로그인 토큰과 마지막으로 받은 군민증만 둔다.
const TOKEN_KEY = 'yanggu-auth-token'
const CITIZEN_KEY = 'yanggu-cyber-citizen'

type ServerUser = {
  id: string
  name: string
  email: string
  birth: string
  design: CardDesign
  cardNo: string
  issuedAt: string
  expiresAt: string
}

export type SignupForm = {
  name: string
  email: string
  password: string
  birth: string
  design: CardDesign
}

function toCitizen(user: ServerUser): Citizen {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    phone: '',
    birth: user.birth,
    zip: '',
    address: '',
    detailAddress: '',
    design: user.design,
    visitCount: '',
    visitPurpose: '',
    companion: 'baekkobi',
    emailAgree: false,
    smsAgree: false,
    issuedAt: user.issuedAt,
    cardNo: user.cardNo,
    expiresAt: user.expiresAt,
  }
}

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function save(token: string | null, citizen: Citizen | null) {
  try {
    if (token && citizen) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(CITIZEN_KEY, JSON.stringify(citizen))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(CITIZEN_KEY)
    }
  } catch {
    // 저장이 막힌 브라우저에서는 이 화면에서만 로그인이 유지된다.
  }
}

// 토큰이 없는 예전 데모 군민증은 로그인한 것으로 보지 않는다.
function loadCitizen(): Citizen | null {
  if (!read(TOKEN_KEY)) return null
  try {
    const parsed = JSON.parse(read(CITIZEN_KEY) ?? 'null') as Citizen | null
    return parsed?.id ? parsed : null
  } catch {
    return null
  }
}

async function post(action: string, body: object, token?: string | null) {
  const res = await fetch(`/api/auth?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { token?: string; user?: ServerUser; error?: string }
  return { ok: res.ok, status: res.status, ...data }
}

// 서버가 준 한국어 안내는 그대로 보여 주고, 연결 문제는 한 문장으로 알린다.
function errorText(status: number, error?: string) {
  if (status >= 400 && status < 500 && error) return error
  return '지금은 서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.'
}

type AuthValue = {
  citizen: Citizen | null
  token: string | null
  login: (email: string, password: string) => Promise<string | null>
  signup: (form: SignupForm) => Promise<string | null>
  loginWithGoogle: (credential: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [citizen, setCitizen] = useState<Citizen | null>(loadCitizen)
  const [token, setToken] = useState<string | null>(() => (loadCitizen() ? read(TOKEN_KEY) : null))

  const apply = useCallback((nextToken: string | null, user: ServerUser | null) => {
    const next = user ? toCitizen(user) : null
    save(nextToken, next)
    setToken(next ? nextToken : null)
    setCitizen(next)
  }, [])

  // 앱을 열 때 한 번, 토큰이 아직 살아 있는지 확인한다. 서버에 못 닿으면 저장된 군민증을 그대로 쓴다.
  const [startToken] = useState(token)
  useEffect(() => {
    if (!startToken) return
    let cancelled = false
    fetch('/api/auth', { headers: { Authorization: `Bearer ${startToken}` } })
      .then(async (res) => {
        if (cancelled) return
        if (res.status === 401) apply(null, null)
        else if (res.ok) apply(startToken, ((await res.json()) as { user: ServerUser }).user)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [startToken, apply])

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await post('login', { email, password })
        if (!res.ok || !res.token || !res.user) return errorText(res.status, res.error)
        apply(res.token, res.user)
        return null
      } catch {
        return errorText(0)
      }
    },
    [apply],
  )

  const signup = useCallback(
    async (form: SignupForm) => {
      try {
        const res = await post('signup', form)
        if (!res.ok || !res.token || !res.user) return errorText(res.status, res.error)
        apply(res.token, res.user)
        return null
      } catch {
        return errorText(0)
      }
    },
    [apply],
  )

  // 구글 버튼이 준 ID 토큰을 서버에 넘기면, 처음이면 가입하고 아니면 로그인한다.
  const loginWithGoogle = useCallback(
    async (credential: string) => {
      try {
        const res = await post('google', { credential })
        if (!res.ok || !res.token || !res.user) return errorText(res.status, res.error)
        apply(res.token, res.user)
        return null
      } catch {
        return errorText(0)
      }
    },
    [apply],
  )

  const logout = useCallback(() => {
    void post('logout', {}, token).catch(() => {})
    apply(null, null)
  }, [apply, token])

  const value = useMemo<AuthValue>(
    () => ({ citizen, token, login, signup, loginWithGoogle, logout }),
    [citizen, token, login, signup, loginWithGoogle, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthProvider가 필요합니다.')
  return ctx
}
