import { CompanionSprite } from './CompanionSprite'
import { companionById, companionLook } from '../companion'
import type { CompanionId, YangguFragment, YangguKind } from '../types'
import { formatDate } from '../utils'

export function YangguPoster({
  name,
  date,
  steps,
  colors,
  moments,
  kinds,
  companionId,
  caption,
  speech,
}: {
  name: string
  date: string
  steps: number
  colors: { hex: string; name: string }[]
  moments: YangguFragment[]
  kinds: YangguKind[]
  companionId?: CompanionId | string
  caption: string
  speech: string
}) {
  const look = companionLook(steps, kinds, moments.length)
  const companion = companionById(companionId)
  const grid = moments.slice(0, 6)

  return (
    <article className="yanggu-poster overflow-hidden rounded-[28px] bg-[#f6f1e6] p-5 shadow-[0_18px_40px_rgba(34,70,16,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[11px] font-extrabold tracking-[0.18em] text-main">MY YANGU FOOTPRINT</p>
          <h2 className="font-display mt-1 text-2xl font-extrabold">
            {name}의 양구 · {formatDate(date)}
          </h2>
        </div>
        <CompanionSprite look={look} className="h-[4.5rem] w-14 shrink-0" />
      </div>

      {grid.length > 0 ? (
        <div className={`mt-4 grid gap-1.5 ${grid.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {grid.map((item, i) => (
            <div
              key={item.id}
              className={`relative overflow-hidden bg-white ${i === 0 && grid.length > 2 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}
            >
              {item.thumb ? (
                <img src={item.thumb} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-main-50 text-sm font-extrabold">{item.label}</div>
              )}
              {item.sticker ? (
                <img
                  src={item.sticker}
                  alt=""
                  className="absolute top-1 left-1 h-10 w-10 object-contain drop-shadow"
                />
              ) : null}
              {i === 0 ? (
                <div className="absolute right-1 bottom-1 rounded-lg bg-white/90 p-0.5">
                  <CompanionSprite look={look} className="h-10 w-8" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-gray-500">사진을 남기면 이 자리에 오늘의 양구가 붙습니다.</p>
      )}

      {colors.length > 0 ? (
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          {colors.map((swatch) => (
            <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} title={swatch.name} />
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-sm font-bold text-ink">
        {steps.toLocaleString('ko-KR')} 걸음 · 색 {colors.length} · 순간 {moments.length}
      </p>
      <p className="mt-1 text-sm text-gray-600">{caption}</p>
      <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-main">
        {speech.replace(`${companion.name}: `, `${companion.name}: `)}
      </p>
    </article>
  )
}
