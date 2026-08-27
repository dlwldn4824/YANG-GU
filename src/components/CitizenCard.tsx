import { useState } from 'react'
import type { Citizen, YangguFragment } from '../types'
import { formatBirth, formatDate } from '../utils'
import { uniqueKinds } from '../journal'

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
          {showCollection ? (
            <div className="no-print absolute inset-0 bg-[#14260a]/90 p-5 text-left text-white">
              <p className="text-[10px] font-bold tracking-[0.22em] text-white/70">YANGU CYBER CITIZEN</p>
              {unique.length === 0 ? (
                <p className="mt-16 text-sm font-bold leading-6">아직 기록된 양구가 없습니다.</p>
              ) : (
                <>
                  <p className="mt-3 text-lg font-extrabold">MY YANGU {new Date().getFullYear()}</p>
                  <div className="relative mt-6 h-[58%]">
                    {unique.map((item, i) => (
                      <span
                        key={item.id}
                        className="absolute grid h-14 w-14 place-items-center text-3xl"
                        style={{
                          left: `${(i * 37) % 70}%`,
                          top: `${(i * 29) % 62}%`,
                          transform: `rotate(${i % 2 === 0 ? -9 : 8}deg)`,
                        }}
                      >
                        <img src={item.sticker} alt={item.label} className="h-14 w-14 object-contain drop-shadow" />
                      </span>
                    ))}
                  </div>
                  <p className="absolute right-5 bottom-5 text-xs font-bold">양구에서 모은 조각 {unique.length}개</p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </button>
      <p className="no-print mt-3 text-center text-xs text-gray-500">
        {showCollection ? '카드를 누르면 여행이 쌓인 뒷면이 보여요' : '카드를 눌러 뒷면을 확인하세요'}
      </p>
    </div>
  )
}
