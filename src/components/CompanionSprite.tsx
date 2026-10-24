import { useState } from 'react'
import type { CompanionLook } from '../companion'
import { BAEKKOBI_SRC } from '../companion'
import { growthSources } from '../raise'

type Props = {
  look?: CompanionLook
  level?: number
  className?: string
}

const DEFAULT_LOOK: CompanionLook = { sit: false, bag: false, hat: false, hold: 'none' }

export function CompanionSprite({ look = DEFAULT_LOOK, level, className = 'h-28 w-28' }: Props) {
  const sources = level ? growthSources(level) : [BAEKKOBI_SRC]
  const [failed, setFailed] = useState<string[]>([])
  const src = sources.find((item) => !failed.includes(item)) ?? BAEKKOBI_SRC

  return (
    <span className={`relative inline-block ${className}`}>
      <img
        key={src}
        src={src}
        alt="배꼬비"
        onError={() => setFailed((prev) => (prev.includes(src) ? prev : [...prev, src]))}
        className={`h-full w-full object-contain drop-shadow-sm transition-transform ${look.sit ? 'translate-y-1.5' : ''}`}
      />
    </span>
  )
}
