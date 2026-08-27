import type { CompanionHold, CompanionLook } from '../companion'
import { companionById } from '../companion'
import type { CompanionId } from '../types'

type Props = {
  id?: CompanionId | string
  look?: CompanionLook
  className?: string
}

const DEFAULT_LOOK: CompanionLook = { sit: false, bag: false, hat: false, hold: 'none' }

export function CompanionSprite({ id, look = DEFAULT_LOOK, className = 'h-28 w-28' }: Props) {
  const companion = companionById(id)
  const body = companion.color
  const skin = '#f3d7be'
  const y = look.sit ? 4 : 0

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {look.hat ? <rect x="10" y={2 + y} width="12" height="3" fill="#2a4a12" /> : null}
      <rect x="11" y={5 + y} width="10" height="8" fill={skin} />
      <rect x="13" y={8 + y} width="2" height="2" fill="#212121" />
      <rect x="17" y={8 + y} width="2" height="2" fill="#212121" />
      <rect x="10" y={13 + y} width="12" height="9" fill={body} />
      {look.sit ? (
        <>
          <rect x="10" y="24" width="5" height="6" fill="#2c3a22" />
          <rect x="17" y="24" width="5" height="6" fill="#2c3a22" />
        </>
      ) : (
        <>
          <rect x="11" y="22" width="4" height="8" fill="#2c3a22" />
          <rect x="17" y="22" width="4" height="8" fill="#2c3a22" />
        </>
      )}
      {look.bag ? <rect x="7" y={16 + y} width="4" height="5" fill="#6b4a32" /> : null}
      <Hold item={look.hold} y={y} />
    </svg>
  )
}

function Hold({ item, y }: { item: CompanionHold; y: number }) {
  if (item === 'melon') return <rect x="22" y={16 + y} width="6" height="5" rx="1" fill="#c5d45a" />
  if (item === 'coffee') return <rect x="22" y={15 + y} width="5" height="6" fill="#6b4a32" />
  if (item === 'bread') return <rect x="22" y={16 + y} width="6" height="4" fill="#e0b070" />
  if (item === 'camera') return <rect x="22" y={16 + y} width="6" height="4" fill="#3a342c" />
  return null
}
