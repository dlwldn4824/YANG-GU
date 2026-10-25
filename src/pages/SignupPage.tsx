import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { OfficialSignup } from '../components/OfficialSignup'
import { GoogleLogin } from '../components/GoogleLogin'
import { useAuth } from '../auth'
import { CARD_DESIGNS } from '../data'
import type { CardDesign } from '../types'
import { nextPath } from '../utils'

// 플리마켓에서 바로 쓸 수 있게 이름·이메일·비밀번호만 받는다. 생년월일은 군민증 뒷면에 들어가는 선택 항목.
export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [birth, setBirth] = useState('')
  const [design, setDesign] = useState<CardDesign>(4)
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const validate = () => {
    if (!name.trim()) return '이름을 입력해 주세요.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return '이메일 형식이 올바르지 않아요.'
    if (password.length < 6) return '비밀번호는 6자 이상이어야 해요.'
    if (password !== password2) return '비밀번호가 서로 달라요.'
    if (!agree) return '개인정보 수집·이용에 동의해 주세요.'
    return ''
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }
    setBusy(true)
    const failed = await signup({ name: name.trim(), email: email.trim(), password, birth, design })
    setBusy(false)
    if (failed) {
      setError(failed)
      return
    }
    navigate(nextPath(params))
  }

  const input = 'w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-main'

  return (
    <>
      <PageHeader title="배꼬비 계정 만들기" desc="공식 군민증을 받았다면, 같은 이메일로 가입해 배꼬비를 키우고 랭킹에 참가하세요." />
      <main className="mx-auto max-w-md px-4 py-8">
        <OfficialSignup />
        <GoogleLogin onDone={() => navigate(nextPath(params))} />
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold">이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              autoComplete="name"
              placeholder="랭킹에 보일 이름 (12자까지)"
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="공식 군민증에 쓴 이메일"
              className={`mt-1 ${input}`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="6자 이상"
              className={`mt-1 ${input}`}
            />
          </label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            placeholder="비밀번호 한 번 더"
            className={input}
          />
          <label className="block">
            <span className="text-sm font-bold">
              생년월일 <span className="font-semibold text-gray-400">(선택)</span>
            </span>
            <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} className={`mt-1 ${input}`} />
          </label>

          <fieldset>
            <legend className="text-sm font-bold">군민증 디자인</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CARD_DESIGNS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDesign(item.id)}
                  className={`overflow-hidden rounded-xl border-2 ${design === item.id ? 'border-main' : 'border-transparent'}`}
                >
                  <img src={`/assets/cards/front${item.id}.jpg`} alt={item.name} className="aspect-[5/8] w-full object-cover" />
                  <span className="block py-1 text-[11px] font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            <span className="text-gray-600">
              군민증 발급과 랭킹 표시를 위해 이름·이메일(생년월일은 입력한 경우)을 수집·이용하는 데 동의해요.
            </span>
          </label>

          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-main py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? '가입하는 중...' : '가입하기'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          이미 가입했나요?{' '}
          <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`} className="font-bold text-main">
            로그인
          </Link>
        </p>
      </main>
    </>
  )
}
