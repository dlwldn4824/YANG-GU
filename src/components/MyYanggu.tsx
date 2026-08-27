import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { daySpan, todayFragments, uniqueColors, uniqueKinds, useJournal, visitDays, visitMonths } from '../journal'
import { readPhotoAsFragment } from '../vision'
import { formatDate, formatDuration, formatMonthLabel, localDateIso } from '../utils'
import { kindEmoji } from '../kinds'
import { Icon } from './Icon'

export function MyYanggu() {
  const { fragments, addFragment } = useJournal()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const latest = fragments[0]
  const today = todayFragments(fragments)
  const months = visitMonths(fragments)
  const unique = uniqueKinds(fragments)
  const visits = visitDays(fragments)
  const palette = uniqueColors(fragments)

  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const fragment = await readPhotoAsFragment(file)
      addFragment(fragment)
    } catch {
      setError('사진을 읽지 못했습니다. 다른 사진으로 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="yanggu" className="scroll-mt-24">
      <p className="text-sm font-bold text-sub">나의 양구</p>
      <h2 className="mt-1 text-2xl font-extrabold">나의 양구</h2>
      <p className="mt-2 text-sm text-gray-600">할 일을 채우는 대신, 이미 한 하루가 군민증에 남습니다.</p>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm font-bold">{formatDate(localDateIso())}</p>
        <p className="mt-2 text-lg font-extrabold">오늘의 양구를 한 장 남겨볼까요?</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-main px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? '양구 조각을 꺼내는 중...' : '사진 한 장 추가'}
        </button>
        {error ? <p className="mt-2 text-sm text-gray-500">{error}</p> : null}
      </div>

      {latest ? (
        <article className="mt-5 rounded-2xl bg-[#1b320c] px-5 py-6 text-white">
          <p className="text-sm font-bold text-white/70">{latest.title}</p>
          <div className="mt-4 flex items-center gap-4">
            <img src={latest.sticker} alt={latest.label} className="h-24 w-24 object-contain drop-shadow-lg" />
            <div>
              {latest.lines.map((line) => (
                <p key={line} className="leading-7">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-white/80">{latest.tag}</p>
          {latest.colors && latest.colors.length > 0 ? (
            <div className="mt-4 flex h-3 overflow-hidden rounded-full">
              {latest.colors.map((swatch) => (
                <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} title={swatch.name} />
              ))}
            </div>
          ) : null}
        </article>
      ) : null}

      {today.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-main-100 p-5">
          <p className="text-sm font-bold text-sub">오늘 양구에서 가져가는 것</p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {uniqueKinds(today).map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
          <p className="mt-3 font-extrabold">
            {uniqueKinds(today).length}개의 양구를 남겼어요.
            {daySpan(today) > 60_000 ? ` · ${formatDuration(daySpan(today))}` : ''}
          </p>
        </div>
      ) : null}

      <div className="mt-8">
        <p className="text-sm font-bold text-main">{new Date().getFullYear()}년의 양구</p>
        {unique.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">아직 기록된 양구가 없습니다. 사진 한 장이 첫 조각이 됩니다.</p>
        ) : (
          <>
            <div className="relative mx-auto mt-4 h-56 max-w-sm">
              {unique.map((item, i) => (
                <span
                  key={item.id}
                  title={item.label}
                  className="absolute grid h-20 w-20 place-items-center text-5xl drop-shadow-md"
                  style={{
                    left: `${12 + (i % 3) * 30}%`,
                    top: `${8 + Math.floor(i / 3) * 34}%`,
                    transform: `rotate(${i % 2 === 0 ? -8 : 10}deg)`,
                  }}
                >
                  {kindEmoji(item.kind)}
                </span>
              ))}
            </div>
            <p className="mt-2 text-center text-sm font-bold">양구에서 모은 조각 {unique.length}개</p>
          </>
        )}
      </div>

      {visits > 0 ? (
        <div className="mt-10">
          <h3 className="text-lg font-extrabold">이 군민증과 함께</h3>
          <p className="mt-2 text-sm text-gray-600">양구를 {visits}번 방문했어요.</p>
          <ul className="mt-4 space-y-3">
            {months.map(([month, list]) => (
              <li key={month} className="flex items-center justify-between rounded-2xl bg-main-50 px-4 py-3">
                <span className="font-bold">{formatMonthLabel(`${month}-01`)}</span>
                <span className="text-sm font-semibold text-gray-600">
                  {uniqueKinds(list).map((item) => item.label).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {palette.length > 0 ? (
        <Link to="/yanggu" className="mt-6 block overflow-hidden rounded-2xl">
          <div className="flex h-10">
            {palette.map((swatch) => (
              <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} />
            ))}
          </div>
          <div className="flex items-center justify-between bg-main px-4 py-3 text-sm font-bold text-white">
            나의 양구 한 장
            <Icon name="right" className="h-4 w-4" />
          </div>
        </Link>
      ) : null}
    </section>
  )
}
