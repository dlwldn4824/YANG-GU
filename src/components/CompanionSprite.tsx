import type { CompanionLook } from '../companion'
import { BAEKKOBI_SRC } from '../companion'

type Props = {
  look?: CompanionLook
  className?: string
}

const DEFAULT_LOOK: CompanionLook = { sit: false, bag: false, hat: false, hold: 'none' }

export function CompanionSprite({ look = DEFAULT_LOOK, className = 'h-28 w-28' }: Props) {
  return (
    <span className={`relative inline-block ${className}`}>
      <img
        src={BAEKKOBI_SRC}
        alt="배꼬비"
        className={`h-full w-full object-contain drop-shadow-sm transition-transform ${look.sit ? 'translate-y-1.5' : ''}`}
      />
    </span>
  )
}
