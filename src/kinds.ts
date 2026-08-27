import type { YangguKind } from './types'

export function kindEmoji(kind: YangguKind) {
  if (kind === 'melon') return '🍈'
  if (kind === 'coffee') return '☕'
  if (kind === 'bread') return '🥐'
  if (kind === 'flower') return '🌼'
  if (kind === 'family') return '👨‍👩‍👧'
  if (kind === 'mountain') return '🏔️'
  if (kind === 'apple') return '🍎'
  return '🍲'
}
