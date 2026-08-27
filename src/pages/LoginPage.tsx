import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../auth'

export function LoginPage() {
  const { login, citizen } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(citizen?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const msg = login(email, password)
    if (msg) {
      setError(msg)
      return
    }
    navigate('/card')
  }

  return (
    <>
      <PageHeader kicker="LOGIN" title="로그인" desc="발급 시 등록한 이메일로 군민증을 불러옵니다." />
      <main className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-main"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-main"
          />
          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
          <button type="submit" className="w-full rounded-full bg-main py-3 font-bold text-white">
            로그인
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          아직 군민증이 없나요?{' '}
          <Link to="/issue" className="font-bold text-main">
            발급받기
          </Link>
        </p>
      </main>
    </>
  )
}
