import type { CommaMood, CommaSpace, PartnerGeo, PickStory } from '../types'

/** 양구군청(읍내) 기본 좌표. 위치 권한이 없을 때 사용 */
export const YANGGU_CENTER = { lat: 38.1096, lng: 127.9897 }

export const PARTNER_GEO: Record<string, PartnerGeo> = {
  parksookeun: { lat: 38.1048, lng: 127.9795 },
  astro: { lat: 38.0755, lng: 127.9872 },
  arboretum: { lat: 38.1194, lng: 128.011 },
  dutayeon: { lat: 38.2467, lng: 127.996 },
  baekkop: { lat: 38.1025, lng: 127.9838 },
  terrace: { lat: 38.1078, lng: 128.0482 },
  punches: { lat: 38.2872, lng: 128.1448 },
  yangguga: { lat: 38.0952, lng: 127.9748 },
  farm: { lat: 38.0956, lng: 127.9848 },
  wood: { lat: 38.121, lng: 127.968 },
  mokhwa: { lat: 38.1102, lng: 127.9904 },
  dumu: { lat: 38.081, lng: 127.958 },
  yangjimal: { lat: 38.1034, lng: 127.9821 },
  mansu: { lat: 38.221, lng: 127.972 },
  forest: { lat: 38.214, lng: 127.981 },
  jige: { lat: 38.132, lng: 128.028 },
  neutinamu: { lat: 38.1021, lng: 127.9844 },
  hanna: { lat: 38.1004, lng: 127.9786 },
  ungjin: { lat: 38.0941, lng: 127.9722 },
  tteurak: { lat: 38.102, lng: 127.9835 },
  salon: { lat: 38.1091, lng: 127.9922 },
  hangwa: { lat: 38.1072, lng: 127.9881 },
}

export const WEEKLY_PICKS: PickStory[] = [
  {
    id: 'season',
    weekLabel: '멜론',
    title: '요즘 멜론이 가장 맛있을 때',
    line: '집에 가기 전 사가기 좋은 곳',
    image: '/assets/benefits/farm.jpg',
    partnerIds: ['farm', 'hangwa'],
  },
  {
    id: 'bread',
    weekLabel: '빵',
    title: '양구 오면 이 빵 많이 사가요',
    line: '오늘 4시 전에 가는 걸 추천',
    image: '/assets/benefits/baekkop.jpg',
    partnerIds: ['baekkop'],
  },
  {
    id: 'lunch',
    weekLabel: '점심',
    title: '양구군 직원들이 자주 가는 점심',
    line: '실제 점심시간에 자주 찾는 메뉴',
    image: '/assets/benefits/yangguga.jpg',
    partnerIds: ['yangguga', 'baekkop', 'terrace'],
  },
  {
    id: 'linger',
    weekLabel: '카페',
    title: '오늘 같은 더운 날 오래 있기 좋은 곳',
    line: '시원하고 좌석 넓은 제휴 카페',
    image: '/assets/benefits/terrace.jpg',
    partnerIds: ['terrace', 'punches', 'baekkop'],
    linger: true,
  },
]

export const COMMA_MOODS: { id: CommaMood; label: string }[] = [
  { id: 'book', label: '책 읽기 좋은 카페' },
  { id: 'window', label: '창밖 보기 좋은 곳' },
  { id: 'family', label: '가족과 이야기하기 좋은 곳' },
  { id: 'walk', label: '산책 후 쉬기 좋은 곳' },
]

export const COMMA_SPACES: CommaSpace[] = [
  {
    partnerId: 'terrace',
    mood: 'window',
    vibe: '시원하고 창밖을 오래 보기 좋아요',
    stayPerk: '음료 주문 + 사이버 군민증 → 양구 엽서 제공',
    sample: {
      name: '양구 멜론 시식',
      line: '카페에서 천천히 쉬다 멜론 한 조각을 맛봐요',
      shopId: 'farm',
    },
  },
  {
    partnerId: 'baekkop',
    mood: 'family',
    vibe: '빵을 나눠 먹으며 이야기하기 좋아요',
    stayPerk: '음료 주문 + 사이버 군민증 → 작은 디저트 제공',
  },
  {
    partnerId: 'punches',
    mood: 'walk',
    vibe: '해안 풍경을 보고 들어와 쉬기 좋아요',
    stayPerk: '음료 주문 + 사이버 군민증 → 두 번째 음료 혜택',
    sample: {
      name: '양구 간식 샘플',
      line: '쉬면서 지역 간식을 먼저 맛봐요',
      shopId: 'hangwa',
    },
  },
  {
    partnerId: 'yangguga',
    mood: 'book',
    vibe: '한적해서 책 읽기 좋아요',
    stayPerk: '사이버 군민증 제시 → 지역 잡지·책 대여',
  },
  {
    partnerId: 'parksookeun',
    mood: 'walk',
    vibe: '산책 후 천천히 머물기 좋아요',
    stayPerk: '군민 요금으로 여유 있게 관람',
  },
  {
    partnerId: 'arboretum',
    mood: 'walk',
    vibe: '숲을 걷고 그늘에서 쉬기 좋아요',
    stayPerk: '군민 요금으로 오래 머물 수 있어요',
  },
  {
    partnerId: 'neutinamu',
    mood: 'family',
    vibe: '가족과 이야기하며 머물기 좋아요',
    stayPerk: '숙박 시 사이버 군민 혜택',
  },
]

export const COMMA_PARTNER_IDS = new Set(COMMA_SPACES.map((space) => space.partnerId))

export function isCommaPartner(id: string) {
  return COMMA_PARTNER_IDS.has(id)
}
