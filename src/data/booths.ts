// 플리마켓 부스. QR에는 `/q/<id>` 주소를 넣는다.
export type Booth = {
  id: string
  name: string
  host: string
  line: string
  items: string[]
  spot: string
}

export const BOOTHS: Booth[] = [
  {
    id: 'yanggu-explore',
    name: '양구 탐험 부스',
    host: '양구 사이버 군민증',
    line: '배꼬비와 함께 양구를 걷고 모으는 부스예요.',
    items: ['배꼬비 스티커', '사이버 군민증 발급'],
    spot: '플리마켓 입구',
  },
  {
    id: 'melon',
    name: '양구 멜론 상회',
    host: '해안면 농가',
    line: '펀치볼에서 키운 멜론을 맛보고 가세요.',
    items: ['멜론 컵', '멜론 주스'],
    spot: 'A-03',
  },
  {
    id: 'craft',
    name: '두무리 손공방',
    host: '양구 공예 모임',
    line: '양구 백토로 빚은 작은 그릇과 소품.',
    items: ['백자 컵', '도자기 키링'],
    spot: 'B-07',
  },
]

export function boothById(id?: string) {
  return BOOTHS.find((booth) => booth.id === id)
}
