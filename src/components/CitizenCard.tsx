import { useState } from 'react'
import type { Citizen, ColorSwatch, YangguFragment } from '../types'
import { formatBirth, formatDate } from '../utils'
import { uniqueColors, uniqueKinds } from '../journal'
import { kindEmoji } from '../kinds'
import { BAEKKOBI_SRC } from '../companion'

type Props = {
  citizen?: Citizen | null
  design?: 1 | 2 | 3 | 4
  flipped?: boolean
  onToggle?: () => void
  className?: string
  fragments?: YangguFragment[]
  showCollection?: boolean
}

export function CitizenCard({
  citizen,
  design,
  flipped,
  onToggle,
  className = '',
  fragments = [],
  showCollection = false,
}: Props) {
  const [localFlip, setLocalFlip] = useState(false)
  const isFlipped = flipped ?? localFlip
  const cardDesign = citizen?.design ?? design ?? 4
  const lightText = cardDesign === 1
  const unique = uniqueKinds(fragments)
  const palette = uniqueColors(fragments)

  const toggle = () => {
    if (onToggle) onToggle()
    else setLocalFlip((v) => !v)
  }

  return (
    <div className={`card-scene mx-auto w-[min(100%,320px)] ${className}`}>
      <button
        type="button"
        aria-label="군민증 앞뒷면 뒤집기"
        onClick={toggle}
        className={`card-flip print-card w-full ${isFlipped ? 'is-flipped' : ''}`}
      >
        <div className="card-face">
          <img
            src={`/assets/cards/front${cardDesign}.jpg`}
            alt="사이버 군민증 앞면"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="card-face card-face-back">
          <div className={`absolute inset-0 ${showCollection ? 'hidden print:block' : ''}`}>
            <img
              src={`/assets/cards/back${cardDesign}.jpg`}
              alt="사이버 군민증 뒷면"
              className="h-full w-full object-cover"
            />
            {citizen ? (
              <div className={`absolute inset-0 text-[11px] leading-none ${lightText ? 'text-white' : 'text-ink'}`}>
                <p className="absolute top-[3.9%] left-[8%] w-[16%] text-center text-[10px] opacity-80">
                  {citizen.cardNo.slice(-4)}
                </p>
                <p className="absolute top-[21%] left-[35%] font-semibold">{citizen.name}</p>
                <p className="absolute top-[24.9%] left-[35%]">{formatBirth(citizen.birth)}</p>
                <p className="absolute top-[29.6%] left-[35%] w-[52%] leading-tight">
                  {citizen.address} {citizen.detailAddress}
                </p>
                <p className="absolute top-[53.3%] left-[18.2%] text-[11px]">
                  <b>발급일 :</b> {formatDate(citizen.issuedAt).replaceAll('.', ' . ')}
                </p>
                <p className="absolute bottom-[7.2%] left-[39%]">{citizen.expiresAt.slice(0, 4)}</p>
                <p className="absolute bottom-[7.2%] left-[53.5%]">{citizen.expiresAt.slice(5, 7)}</p>
                <p className="absolute bottom-[7.2%] left-[62.5%]">{citizen.expiresAt.slice(8, 10)}</p>
              </div>
            ) : null}
          </div>
          {showCollection ? (
            <CollectionBack name={citizen?.name} items={unique} colors={palette} />
          ) : null}
        </div>
      </button>
      <p className="no-print mt-3 text-center text-xs text-gray-500">
        {showCollection ? '카드를 누르면 모은 조각이 있는 뒷면이 보여요' : '카드를 눌러 뒷면을 확인하세요'}
      </p>
    </div>
  )
}

function CollectionBack({
  name,
  items,
  colors,
}: {
  name?: string
  items: YangguFragment[]
  colors: ColorSwatch[]
}) {
  return (
    <div className="no-print absolute inset-0 flex flex-col bg-[#1b320c] px-5 pt-5 pb-4 text-left text-white">
      <p className="text-[11px] font-bold tracking-[0.18em] text-white/70">사이버 군민증</p>
      {name ? <p className="mt-1 text-sm font-bold text-white/80">{name} 님</p> : null}
      <p className="font-display mt-4 text-[22px] leading-tight font-extrabold">
        {new Date().getFullYear()}년의 양구
      </p>
      <p className="mt-1 text-sm font-bold text-white/75">모은 조각 {items.length}개</p>

      {items.length === 0 ? (
        <p className="mt-10 text-sm font-bold leading-6 text-white/80">아직 기록된 양구가 없습니다.</p>
      ) : (
        <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4">
          {items.map((item) => (
            <li key={item.id} className="text-center">
              <span className="grid aspect-square place-items-center rounded-2xl bg-white/15 text-[28px]">
                {kindEmoji(item.kind)}
              </span>
              <p className="mt-1.5 text-[12px] font-bold text-white">{item.label}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="relative mt-auto">
        <img
          src={BAEKKOBI_SRC}
          alt=""
          className="pointer-events-none absolute right-0 bottom-8 h-20 w-auto opacity-20"
        />
        {colors.length > 0 ? (
          <div className="relative">
            <p className="text-[11px] font-bold text-white/70">발견한 색</p>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full">
              {colors.map((swatch) => (
                <span key={swatch.hex} className="flex-1" style={{ background: swatch.hex }} title={swatch.name} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
