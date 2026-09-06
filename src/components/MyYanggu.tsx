import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SHOW_VISIT_HISTORY, daySpan, todayFragments, uniqueColors, uniqueKinds, useJournal, visitDays, visitMonths } from '../journal'
import { readPhotoAsFragment } from '../vision'
import { formatDate, formatDuration, formatMonthKo, localDateIso } from '../utils'
import { kindEmoji } from '../kinds'
import { Icon } from './Icon'
import { KindChips } from './KindChips'
import type { YangguFragment } from '../types'

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
  const previews = fragments.filter((item) => item.thumb).slice(0, 3)

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
      <h2 className="font-display mt-1 text-2xl font-extrabold">군민증에 남은 하루</h2>
      <p className="mt-2 text-sm text-gray-600">할 일을 채우는 대신, 이미 한 하루가 군민증에 남습니다.</p>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm font-bold">{formatDate(localDateIso())}</p>
        <p className="mt-2 text-lg font-extrabold">오늘의 양구를 사진으로 남겨볼까요?</p>
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
        <article className="mt-5 overflow-hidden rounded-2xl bg-[#1b320c] text-white">
          {latest.thumb ? (
            <img src={latest.thumb} alt="" className="aspect-[16/9] w-full object-cover opacity-90" />
          ) : null}
          <div className="px-5 py-6">
            <p className="text-sm font-bold text-white/70">{latest.title}</p>
            <div className="mt-3">
              {latest.lines.map((line) => (
                <p key={line} className="leading-7">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-white/80">
              {kindEmoji(latest.kind)} {latest.tag}
            </p>
            {latest.colors && latest.colors.length > 0 ? (
              <div className="mt-4 flex h-3 overflow-hidden rounded-full">
                {latest.colors.map((swatch) => (
                  <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} title={swatch.name} />
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ) : null}

      {today.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-main-100 p-5">
          <p className="text-sm font-bold text-sub">오늘 양구에서 가져가는 것</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {uniqueKinds(today).map((item) => (
              <li
                key={item.id}
                className="rounded-full bg-main-50 px-3 py-1 text-sm font-bold text-main"
              >
                {kindEmoji(item.kind)} {item.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-extrabold">
            {uniqueKinds(today).length}개의 양구를 남겼어요.
            {daySpan(today) > 60_000 ? ` · ${formatDuration(daySpan(today))}` : ''}
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-sub">{new Date().getFullYear()}년의 양구</p>
            <h3 className="font-display mt-1 text-xl font-extrabold">모은 조각 {unique.length}개</h3>
          </div>
          {SHOW_VISIT_HISTORY && visits > 0 ? <p className="text-sm font-bold text-gray-500">방문 {visits}번</p> : null}
        </div>
        {unique.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">아직 기록된 양구가 없습니다. 사진 한 장이 첫 조각이 됩니다.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {unique.map((item) => (
              <li key={item.id}>
                <KindTile item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {SHOW_VISIT_HISTORY && visits > 0 ? (
        <div className="mt-10">
          <h3 className="font-display text-xl font-extrabold">이 군민증과 함께</h3>
          <p className="mt-1 text-sm text-gray-600">양구를 {visits}번 방문한 기록이 월별로 쌓입니다.</p>
          <ul className="mt-4 space-y-3">
            {months.map(([month, list]) => (
              <li key={month} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg font-extrabold text-main">{formatMonthKo(month)}</p>
                  <p className="text-xs font-bold text-gray-400">{list.length}장</p>
                </div>
                <div className="mt-3 flex gap-1.5 overflow-hidden">
                  {list.slice(0, 4).map((item) => (
                    <span key={item.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-main-50">
                      {item.thumb ? (
                        <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-2xl">{kindEmoji(item.kind)}</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <KindChips items={list} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link to="/yanggu" className="mt-8 block overflow-hidden rounded-3xl">
        {previews.length > 0 ? (
          <div className={`grid ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {previews.map((item) => (
              <img key={item.id} src={item.thumb} alt="" className="aspect-[4/3] h-24 w-full object-cover sm:h-28" />
            ))}
          </div>
        ) : palette.length > 0 ? (
          <div className="flex h-10">
            {palette.map((swatch) => (
              <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} />
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between bg-main px-4 py-4 text-white">
          <div>
            <p className="text-[11px] font-bold tracking-wide text-white/80">사진으로 남긴 양구 방문</p>
            <p className="font-display mt-0.5 text-lg font-extrabold">양구 기록 보기</p>
          </div>
          <Icon name="right" className="h-5 w-5" />
        </div>
      </Link>
    </section>
  )
}

function KindTile({ item }: { item: YangguFragment }) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-main-50">
      <div className="relative aspect-square">
        {item.thumb ? (
          <img src={item.thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-main-100 text-3xl">{kindEmoji(item.kind)}</div>
        )}
        <span className="absolute right-1 bottom-1 text-lg drop-shadow">{kindEmoji(item.kind)}</span>
      </div>
      <figcaption className="truncate px-1.5 py-1.5 text-center text-[11px] font-bold">{item.label}</figcaption>
    </figure>
  )
}
