import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { CitizenCard } from '../components/CitizenCard'
import { useAuth } from '../auth'
import { COMPANIONS } from '../companion'
import { CompanionSprite } from '../components/CompanionSprite'
import { CARD_DESIGNS } from '../data'
import type { CardDesign, Citizen, CompanionId } from '../types'
import { addYears, makeCardNo, todayIso } from '../utils'

const VISITS = ['방문예정', '1번', '2번', '3~4번', '5회이상']
const PURPOSES = ['직장', '스포츠대회', '군면회', '관광', '기타']

type Form = {
  name: string
  email: string
  password: string
  password2: string
  phone: string
  birth: string
  design: CardDesign
  companion: CompanionId
  eligible: boolean
  visitCount: string
  visitPurpose: string
  zip: string
  address: string
  detailAddress: string
  privacy: 'Y' | 'N' | ''
  emailAgree: boolean
  smsAgree: boolean
}

const empty: Form = {
  name: '',
  email: '',
  password: '',
  password2: '',
  phone: '',
  birth: '',
  design: 4,
  companion: 'sori',
  eligible: true,
  visitCount: '',
  visitPurpose: '',
  zip: '',
  address: '',
  detailAddress: '',
  privacy: '',
  emailAgree: false,
  smsAgree: false,
}

export function IssuePage() {
  const { citizen, issue } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(empty)
  const [error, setError] = useState('')

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  if (citizen) {
    return (
      <>
        <PageHeader kicker="발급" title="사이버 군민증 발급" desc="이미 발급된 군민증이 있습니다." />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h2 className="text-2xl font-extrabold">이미 발급된 군민증이 있습니다</h2>
          <p className="mt-3 text-gray-600">{citizen.name} 님의 사이버 군민증을 내 군민증에서 확인할 수 있습니다.</p>
          <Link
            to="/card"
            className="mt-8 inline-flex rounded-full bg-main px-6 py-3 font-bold text-white hover:bg-main-dark"
          >
            내 군민증 보기
          </Link>
        </main>
      </>
    )
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.name) return '이름을 입력해 주세요'
      if (!form.email) return '이메일 주소를 입력해 주세요'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return '이메일 형식이 올바르지 않습니다'
      if (!form.password) return '비밀번호를 입력해 주세요'
      if (form.password.length < 6) return '비밀번호는 6자 이상이어야 합니다'
      if (form.password !== form.password2) return '비밀번호가 일치하지 않습니다'
      if (!form.phone) return '전화번호를 입력해 주세요'
      if (!form.birth) return '생년월일을 입력해 주세요'
    }
    if (step === 2 && !form.design) return '군민증 디자인을 선택해 주세요'
    if (step === 3) {
      if (!form.eligible) return '발급 가능 대상 내용을 확인해 주세요'
      if (!form.address) return '실제 거주지를 입력해 주세요'
      if (form.privacy !== 'Y') return '개인정보 수집이용에 동의해 주세요'
    }
    return ''
  }

  const next = () => {
    const msg = validateStep()
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const msg = validateStep()
    if (msg) {
      setError(msg)
      return
    }
    const issuedAt = todayIso()
    const nextCitizen: Citizen = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      birth: form.birth,
      zip: form.zip,
      address: form.address,
      detailAddress: form.detailAddress,
      design: form.design,
      companion: form.companion,
      visitCount: form.visitCount,
      visitPurpose: form.visitPurpose,
      emailAgree: form.emailAgree,
      smsAgree: form.smsAgree,
      issuedAt,
      cardNo: makeCardNo(),
      expiresAt: addYears(issuedAt, 3),
    }
    issue(nextCitizen)
    navigate('/card', { replace: true })
  }

  return (
    <>
      <PageHeader kicker="발급" title="사이버 군민증 발급" desc="* 표시는 필수 입력 사항입니다." />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ol className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {['기본 정보', '카드·캐릭터', '거주·동의'].map((label, i) => (
            <li
              key={label}
              className={`rounded-full py-2 ${step === i + 1 ? 'bg-main text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {step === 1 ? (
            <>
              <Field label="이름" required>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="이름을 입력해주세요"
                  className="field"
                />
              </Field>
              <Field label="이메일 주소" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="field"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="비밀번호" required>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                    className="field"
                  />
                </Field>
                <Field label="비밀번호 확인" required>
                  <input
                    type="password"
                    value={form.password2}
                    onChange={(e) => set('password2', e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                    className="field"
                  />
                </Field>
              </div>
              <Field label="전화번호" required>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="전화번호를 입력해주세요"
                  className="field"
                />
              </Field>
              <Field label="생년월일" required>
                <input type="date" value={form.birth} onChange={(e) => set('birth', e.target.value)} className="field" />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <div>
              <p className="mb-3 text-sm font-bold">
                군민증 디자인 선택 <em className="text-point">*</em>
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CARD_DESIGNS.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer overflow-hidden rounded-2xl border-2 ${
                      form.design === item.id ? 'border-main' : 'border-transparent'
                    }`}
                  >
                    <img src={`/assets/cards/front${item.id}.jpg`} alt={item.name} className="aspect-[320/510] w-full object-cover" />
                    <div className="flex items-center justify-center gap-2 py-2 text-sm font-semibold">
                      <input
                        type="radio"
                        name="design"
                        checked={form.design === item.id}
                        onChange={() => set('design', item.id)}
                      />
                      {item.id}번 · {item.name}
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6">
                <CitizenCard design={form.design} />
              </div>
              <p className="mt-8 mb-3 text-sm font-bold">
                함께 다닐 군민 캐릭터 <em className="text-point">*</em>
              </p>
              <p className="mb-3 text-sm text-gray-600">걸음이나 사진을 채우라고 보채지 않습니다. 오늘 한 일에 맞춰 모습이 바뀝니다.</p>
              <div className="grid grid-cols-2 gap-3">
                {COMPANIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => set('companion', item.id)}
                    className={`rounded-2xl border-2 p-3 text-left ${
                      form.companion === item.id ? 'border-main bg-main-50' : 'border-gray-100'
                    }`}
                  >
                    <CompanionSprite id={item.id} className="h-16 w-16" />
                    <p className="font-display mt-2 font-extrabold">{item.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.line}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <>
              <div className="rounded-2xl bg-main-50 p-4 text-sm leading-relaxed text-gray-700">
                양구사랑사이버군민증은 주민등록 이전 없이도 관광지 입장료 할인 등 혜택을 제공하기 위한 제도로, 관외
                주민등록자를 대상으로 합니다.
                <label className="mt-3 flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.eligible}
                    onChange={(e) => set('eligible', e.target.checked)}
                  />
                  발급 가능 대상 내용을 확인했습니다
                </label>
              </div>
              <Field label="양구 방문 경험 (최근 1년)">
                <div className="flex flex-wrap gap-2">
                  {VISITS.map((v) => (
                    <Chip key={v} active={form.visitCount === v} onClick={() => set('visitCount', v)}>
                      {v}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="방문 목적">
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map((v) => (
                    <Chip key={v} active={form.visitPurpose === v} onClick={() => set('visitPurpose', v)}>
                      {v}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="실제 거주지" required hint="동, 호수까지 기재해 주세요">
                <div className="space-y-2">
                  <input
                    value={form.zip}
                    onChange={(e) => set('zip', e.target.value)}
                    placeholder="우편번호"
                    className="field"
                  />
                  <input
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="주소"
                    className="field"
                  />
                  <input
                    value={form.detailAddress}
                    onChange={(e) => set('detailAddress', e.target.value)}
                    placeholder="상세주소"
                    className="field"
                  />
                </div>
              </Field>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="font-bold">
                  개인정보 수집이용에 대한 동의 <em className="text-point">*</em>
                </p>
                <div className="mt-2 flex gap-4 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input type="radio" checked={form.privacy === 'Y'} onChange={() => set('privacy', 'Y')} /> 동의
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="radio" checked={form.privacy === 'N'} onChange={() => set('privacy', 'N')} /> 비동의
                  </label>
                </div>
                <p className="mt-4 font-bold">마케팅 활용 수신동의</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={form.emailAgree}
                      onChange={(e) => set('emailAgree', e.target.checked)}
                    />
                    이메일 수신동의
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={form.smsAgree} onChange={(e) => set('smsAgree', e.target.checked)} />
                    SMS 수신 동의
                  </label>
                </div>
              </div>
            </>
          ) : null}

          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

          <div className="sticky bottom-20 z-20 flex gap-3 bg-white/95 py-3 backdrop-blur lg:bottom-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setStep((s) => s - 1)
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 font-bold text-gray-600"
              >
                이전
              </button>
            ) : null}
            {step < 3 ? (
              <button type="button" onClick={next} className="flex-1 rounded-full bg-main py-3 font-bold text-white">
                다음
              </button>
            ) : (
              <button type="submit" className="flex-1 rounded-full bg-main py-3 font-bold text-white">
                등록
              </button>
            )}
          </div>
        </form>
      </main>
    </>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-bold">
        {label}
        {required ? <em className="text-point">*</em> : null}
        {hint ? <span className="font-normal text-gray-500">{hint}</span> : null}
      </p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
        active ? 'bg-main text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  )
}
