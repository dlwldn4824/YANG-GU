import { useRef, useState } from 'react'
import { useAuth } from '../auth'
import { daySpan, filmFrames, uniqueColors, useJournal } from '../journal'
import { readPhotoAsFragment } from '../vision'
import { formatDate, formatDuration } from '../utils'
import { Icon } from '../components/Icon'

export function FilmPage() {
  const { citizen } = useAuth()
  const { fragments, addFragment } = useJournal()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const frames = filmFrames(fragments)
  const colors = uniqueColors(fragments)
  const first = frames[0]
  const last = frames[frames.length - 1]

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
    <div className="bg-[#14120f] pb-8 text-[#f4ead8]">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#c5d45a]">필름</p>
            <h1 className="mt-2 text-3xl font-extrabold">{citizen?.name ?? '나의'}의 양구 컬러 필름</h1>
          </div>
          <button type="button" onClick={() => window.print()} className="mt-2 shrink-0 text-sm font-bold text-[#f4ead8]/70">
            저장
          </button>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#f4ead8]/75">
          길을 걷다 자유롭게 찍으면, 사진의 대표색이 군민증에 쌓입니다. 완주하거나 보상받을 일은 없어요. 더 많이 걷고
          볼수록 필름만 풍성해집니다.
        </p>

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
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c5d45a] px-5 py-3 text-sm font-extrabold text-[#14120f] disabled:opacity-60"
        >
          <Icon name="scan" className="h-4 w-4" />
          {busy ? '색을 꺼내는 중...' : '걷다 찍기'}
        </button>
        {error ? <p className="mt-2 text-sm text-[#f4ead8]/60">{error}</p> : null}

        {colors.length > 0 ? (
          <section className="mt-8">
            <p className="text-xs font-bold tracking-[0.16em] text-[#f4ead8]/50">모은 색</p>
            <div className="mt-3 overflow-hidden rounded-2xl">
              <div className="flex h-14">
                {colors.map((swatch) => (
                  <div key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} title={swatch.name} />
                ))}
              </div>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {colors.map((swatch) => (
                <span key={swatch.hex} className="shrink-0 text-[11px] font-semibold text-[#f4ead8]/80">
                  <i className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: swatch.hex }} />
                  {swatch.name}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="film-strip mt-10 rounded-[28px] bg-[#1d1a16] px-3 py-6">
          <div className="flex justify-between px-2 text-[10px] font-bold tracking-[0.24em] text-[#f4ead8]/35">
            <span>양구</span>
            <span>{frames.length}칸</span>
          </div>
          {frames.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-[#f4ead8]/50">아직 필름이 비어 있어요. 길에서 한 장을 찍으면 첫 칸이 생깁니다.</p>
          ) : (
            <ol className="mt-4 space-y-5">
              {frames.map((frame, i) => (
                <li key={frame.id} className="overflow-hidden rounded-xl bg-black">
                  <div className="relative aspect-[3/2] bg-[#2a261f]">
                    {frame.thumb ? (
                      <img src={frame.thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-lg font-extrabold text-[#f4ead8]/70">
                        {frame.label}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex h-3">
                    {(frame.colors ?? []).length > 0
                      ? (frame.colors ?? []).map((swatch) => (
                          <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} />
                        ))
                      : <span className="flex-1 bg-[#3a342c]" />}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-[11px] text-[#f4ead8]/70">
                    <span>
                      {frame.area} · {frame.label}
                    </span>
                    <span>{frame.tag.split('·').pop()?.trim()}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 px-2 text-center text-[11px] leading-5 text-[#f4ead8]/45">
            {first && last ? (
              <p>
                {formatDate(first.date)} — {formatDate(last.date)}
                {daySpan(frames) > 60_000 ? ` · ${formatDuration(daySpan(frames))}` : ''}
              </p>
            ) : null}
            <p className="mt-1">걷고 본 만큼만 남습니다. 다 채우지 않아도 됩니다.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
