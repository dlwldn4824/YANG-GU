import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth'

const GSI_SRC = 'https://accounts.google.com/gsi/client'

type GoogleId = {
  initialize: (options: { client_id: string; callback: (res: { credential: string }) => void; ux_mode?: 'popup' }) => void
  renderButton: (el: HTMLElement, options: Record<string, string | number>) => void
}
type GoogleWindow = Window & { google?: { accounts: { id: GoogleId } } }

// 카카오톡·인스타그램·페이스북·라인 안의 브라우저에서는 구글이 로그인을 막는다.
function inAppBrowser() {
  const ua = navigator.userAgent
  if (/KAKAOTALK/i.test(ua)) return 'kakao'
  if (/Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps/i.test(ua)) return 'other'
  return null
}

let clientIdRequest: Promise<string | null> | null = null

// Client ID는 Vercel 환경변수(GOOGLE_CLIENT_ID)에 있고, 서버에서 받아 온다. 없으면 버튼을 숨긴다.
function loadClientId() {
  clientIdRequest ??= fetch('/api/auth?action=config')
    .then((res) => (res.ok ? (res.json() as Promise<{ googleClientId: string | null }>) : null))
    .then((data) => data?.googleClientId ?? null)
    .catch(() => null)
  return clientIdRequest
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if ((window as GoogleWindow).google?.accounts) return resolve()
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = GSI_SRC
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('gsi')), { once: true })
  })
}

export function GoogleLogin({ onDone }: { onDone: () => void }) {
  const { loginWithGoogle } = useAuth()
  const holder = useRef<HTMLDivElement>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inApp = inAppBrowser()
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    let alive = true
    void loadClientId().then((id) => alive && setClientId(id))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!clientId || inApp || !holder.current) return
    const el = holder.current
    loadScript()
      .then(() => {
        const google = (window as GoogleWindow).google?.accounts.id
        if (!google) return
        google.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: async ({ credential }) => {
            setBusy(true)
            const msg = await loginWithGoogle(credential)
            setBusy(false)
            if (msg) setError(msg)
            else done.current()
          },
        })
        google.renderButton(el, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'ko',
          width: Math.min(400, el.clientWidth || 320),
        })
      })
      .catch(() => setError('구글 로그인을 불러오지 못했어요.'))
  }, [clientId, inApp, loginWithGoogle])

  if (!clientId) return null

  const openOutside = () => {
    location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`
  }

  return (
    <div className="mb-6">
      {inApp ? (
        <div className="rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm">
          <p className="font-bold">이 앱 안에서는 구글 로그인이 안 돼요</p>
          <p className="mt-1 text-xs text-gray-500">
            {inApp === 'kakao'
              ? '아래 버튼으로 휴대폰 기본 브라우저에서 열어 주세요.'
              : '오른쪽 위 메뉴(⋯)에서 "다른 브라우저로 열기"를 눌러 주세요.'}
          </p>
          {inApp === 'kakao' ? (
            <button
              type="button"
              onClick={openOutside}
              className="mt-3 rounded-full bg-main px-4 py-2 text-xs font-bold text-white"
            >
              기본 브라우저로 열기
            </button>
          ) : null}
        </div>
      ) : (
        <div ref={holder} className={`flex min-h-11 justify-center ${busy ? 'pointer-events-none opacity-60' : ''}`} />
      )}
      {error ? <p className="mt-2 text-center text-sm font-semibold text-red-500">{error}</p> : null}
      <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는 이메일로
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  )
}
