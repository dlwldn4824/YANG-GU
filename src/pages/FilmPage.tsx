import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { companionById, companionLook, companionSpeech, posterCaption } from '../companion'
import { WEEKLY_PICKS, PARTNER_GEO } from '../data/picks'
import { BENEFITS } from '../data'
import { formatWalkMinutes, haversineMeters } from '../geo'
import { todayFragments, uniqueColors, uniqueKinds, useJournal, visitDays, visitMonths } from '../journal'
import { useDaySteps } from '../steps'
import { useOrigin } from '../useOrigin'
import { formatMonthKo, localDateIso, parseKnownSaving } from '../utils'
import { readPhotoAsFragment } from '../vision'
import { CompanionSprite } from '../components/CompanionSprite'
import { KindChips } from '../components/KindChips'
import { YangguPoster } from '../components/YangguPoster'
import { Icon } from '../components/Icon'
import type { YangguKind } from '../types'

const PICK_KIND: Record<string, YangguKind> = {
  season: 'melon',
  bread: 'bread',
  lunch: 'food',
  linger: 'coffee',
}

export function FilmPage() {
  const { citizen } = useAuth()
  const { fragments, addFragment } = useJournal()
  const { steps, walking, error: walkError, startWalk, stopWalk } = useDaySteps()
  const { origin } = useOrigin()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const today = todayFragments(fragments)
  const source = today.length > 0 ? today : fragments.slice(0, 6)
  const moments = source.slice(0, 6)
  const kinds = uniqueKinds(today).map((item) => item.kind)
  const colors = uniqueColors(today.length > 0 ? today : fragments)
  const look = companionLook(steps, kinds, today.length)
  const companion = companionById(citizen?.companion)
  const speech = companionSpeech(companion.name, steps, kinds, colors[0]?.name)
  const visits = visitDays(fragments)
  const months = visitMonths(fragments)
  const date = localDateIso()
  const pickHits = WEEKLY_PICKS.filter((story) => kinds.includes(PICK_KIND[story.id])).length
  const missed = unseenPick(kinds, origin)

  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      addFragment(await readPhotoAsFragment(file))
    } catch {
      setError('사진을 읽지 못했습니다. 길을 걷다 다시 찍어 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="wrap py-8">
      <p className="text-sm font-bold text-sub">오늘</p>
      <h1 className="font-display mt-1 text-3xl font-extrabold">{citizen?.name ?? '나의'}의 양구 기록</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
        걸음을 채울 필요는 없습니다. 사진만 남기면 걸음·색·순간이 모여, 오늘 양구 방문이 기록됩니다.
      </p>

      <section className="mt-6 rounded-3xl border border-main-100 bg-main-50 px-5 py-6">
        <div className="flex items-start gap-4">
          <CompanionSprite look={look} className="h-28 w-24 shrink-0" />
          <div>
            <p className="font-display text-lg font-extrabold">{companion.name}</p>
            <p className="mt-1 text-sm text-gray-600">{companion.line}</p>
            <p className="mt-3 text-sm font-semibold text-main">{speech}</p>
          </div>
        </div>

        <p className="mt-6 text-sm font-bold">오늘 양구에서 남긴 발자국</p>
        <p className="font-display mt-1 text-4xl font-extrabold tracking-tight">
          {steps.toLocaleString('ko-KR')}
          <span className="ml-1 text-lg font-bold">걸음</span>
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
          <li>발견한 색 {colors.length}개</li>
          <li>남긴 순간 {today.length}장</li>
          <li>이번 주 추천 {pickHits}개</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => (walking ? stopWalk() : startWalk())}
            className="rounded-full bg-main px-4 py-2 text-sm font-bold text-white"
          >
            {walking ? '걷기 멈추기' : '오늘 걷기 시작'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-main px-4 py-2 text-sm font-bold text-main disabled:opacity-60"
          >
            {busy ? '사진을 읽는 중...' : '사진 남기기'}
          </button>
        </div>
        {walkError ? <p className="mt-2 text-xs text-gray-500">{walkError}</p> : null}
        {error ? <p className="mt-2 text-xs text-gray-500">{error}</p> : null}
      </section>

      {colors.length > 0 ? (
        <section className="mt-8">
          <p className="text-sm font-bold">오늘 발견한 양구색</p>
          <div className="mt-3 overflow-hidden rounded-2xl">
            <div className="flex h-10">
              {colors.map((swatch) => (
                <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} />
              ))}
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {colors.map((swatch) => (
              <li key={swatch.hex} className="flex items-center gap-2">
                <i className="inline-block h-3 w-3 rounded-full" style={{ background: swatch.hex }} />
                <span className="font-semibold">{swatch.name}</span>
                <span className="text-gray-400">{swatch.hex}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">오늘 만든 카드</h2>
          <button type="button" onClick={() => window.print()} className="text-sm font-bold text-main">
            저장
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">찍은 사진으로 자동으로 붙입니다. 디자인을 고를 필요는 없어요.</p>
        <div className="mt-4">
          <YangguPoster
            name={citizen?.name ?? '나의'}
            date={date}
            steps={steps}
            colors={colors.slice(0, 6)}
            moments={moments}
            kinds={kinds}
            companionId={citizen?.companion}
            caption={posterCaption(steps, kinds)}
            speech={speech}
          />
        </div>
      </section>

      {missed ? (
        <section className="mt-10 rounded-3xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-sub">오늘 기록하지 못한 양구 하나</p>
          <h3 className="font-display mt-2 text-xl font-extrabold">{missed.story.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{missed.story.line}</p>
          {missed.partner ? (
            <p className="mt-3 text-sm font-semibold">
              현재 위치에서 {formatWalkMinutes(missed.meters)}
              {missed.saving ? ` · 사이버 군민 혜택 ${missed.saving.toLocaleString('ko-KR')}원` : ` · ${missed.partner.discount}`}
            </p>
          ) : null}
          <Link to={`/pick/${missed.story.id}`} className="mt-4 inline-flex items-center font-bold text-main">
            추천에서 보기 <Icon name="right" className="ml-1 h-4 w-4" />
          </Link>
        </section>
      ) : null}

      {visits > 1 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold">다시 온 양구</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {companion.name}는 그대로 있고, 양구를 {visits}번 방문한 기록이 남아 있습니다.
          </p>
          <ol className="mt-5 overflow-hidden rounded-3xl border border-main-100 bg-white">
            {months.map(([month, list], index) => (
              <li
                key={month}
                className={`flex gap-4 px-5 py-4 ${index > 0 ? 'border-t border-main-100' : ''}`}
              >
                <p className="w-14 shrink-0 pt-0.5 font-display text-lg font-extrabold text-main">
                  {formatMonthKo(month)}
                </p>
                <KindChips items={list} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  )
}

function unseenPick(kinds: YangguKind[], origin: { lat: number; lng: number }) {
  const story = WEEKLY_PICKS.find((item) => !kinds.includes(PICK_KIND[item.id]))
  if (!story) return null
  const partner = BENEFITS.find((item) => item.id === story.partnerIds[0] && PARTNER_GEO[item.id])
  const meters = partner ? haversineMeters(origin, PARTNER_GEO[partner.id]) : 0
  const known = partner ? parseKnownSaving(partner.discount) : null
  return {
    story,
    partner,
    meters,
    saving: known?.saving,
  }
}
