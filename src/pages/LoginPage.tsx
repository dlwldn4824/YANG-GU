import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../auth'
import { nextPath } from '../utils'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.')
      return
    }
    setBusy(true)
    const msg = await login(email, password)
    setBusy(false)
    if (msg) {
      setError(msg)
      return
    }
    navigate(nextPath(params))
  }

  return (
    <>
      <PageHeader title="군민증 불러오기" desc="가입한 이메일로 로그인하면 어느 휴대폰에서든 내 군민증을 불러와요." />
      <main className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-main"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-main"
          />
          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-main py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? '불러오는 중...' : '로그인'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          아직 군민증이 없나요?{' '}
          <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-bold text-main">
            1분 만에 가입하기
          </Link>
        </p>
      </main>
    </>
  )
}
