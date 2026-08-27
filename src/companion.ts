import type { CompanionId, YangguKind } from './types'

export const BAEKKOBI_SRC = '/assets/baekkobi.png'

export type CompanionHold = 'none' | 'melon' | 'coffee' | 'bread' | 'camera'

export type CompanionLook = {
  sit: boolean
  bag: boolean
  hat: boolean
  hold: CompanionHold
}

export const COMPANIONS: {
  id: CompanionId
  name: string
  color: string
  line: string
  src: string
}[] = [
  {
    id: 'baekkobi',
    name: '배꼬비',
    color: '#f6d48a',
    line: '양구를 함께 걷는 공식 캐릭터',
    src: BAEKKOBI_SRC,
  },
]

export function companionById(id?: string) {
  return COMPANIONS.find((item) => item.id === id) ?? COMPANIONS[0]
}

export function companionLook(steps: number, kinds: YangguKind[], photoCount: number): CompanionLook {
  let hold: CompanionHold = 'none'
  if (kinds.includes('melon')) hold = 'melon'
  else if (kinds.includes('coffee')) hold = 'coffee'
  else if (kinds.includes('bread')) hold = 'bread'
  else if (photoCount >= 4) hold = 'camera'
  return {
    sit: steps >= 3000,
    bag: steps >= 500,
    hat: steps >= 1500,
    hold,
  }
}

export function companionSpeech(
  name: string,
  steps: number,
  kinds: YangguKind[],
  colorName?: string,
) {
  if (kinds.includes('melon') && steps >= 3000) return `${name}: 멜론도 먹고 꽤 많이 걸었다!`
  if (kinds.includes('melon')) return `${name}: 오늘 멜론을 발견했어.`
  if (kinds.includes('coffee')) return `${name}: 카페에 앉아 한잔했어.`
  if (colorName) return `${name}: 오늘 ${colorName}을 제일 많이 발견했어!`
  if (steps >= 3000) return `${name}: 오늘 양구 꽤 많이 돌아다녔다!`
  if (steps > 0) return `${name}: ${steps.toLocaleString('ko-KR')}보만큼 양구를 걸었어.`
  return `${name}: 양구를 여행하고 있어요.`
}

export function posterCaption(steps: number, kinds: YangguKind[]) {
  if (steps >= 5000) return '오늘은 양구를 꽤 많이 돌아다녔다.'
  if (kinds.includes('melon') || kinds.includes('coffee')) return '오늘은 양구에서 조금 천천히.'
  if (steps > 0) return '걸은 만큼만 남았다.'
  return '사진 한 장이 오늘의 양구가 된다.'
}
