import type { Citizen, ColorSwatch, YangguFragment, YangguKind } from '../types'

const SEED_KEY = 'yanggu-demo-seed'
const SEED_VERSION = 'issued-v3'
const CITIZEN_KEY = 'yanggu-cyber-citizen'
const FRAGMENT_KEY = 'yanggu-fragments'

export const DEMO_CITIZEN: Citizen = {
  name: '이지우',
  email: 'jiwoo@yanggu.kr',
  password: 'yanggu',
  phone: '010-4821-2026',
  birth: '1995-08-16',
  zip: '01779',
  address: '서울특별시 노원구 화랑로 321',
  detailAddress: '201동 1503호',
  design: 4,
  visitCount: '5회이상',
  visitPurpose: '군면회',
  emailAgree: true,
  smsAgree: true,
  issuedAt: '2026-02-08',
  cardNo: 'YG-2026-4821',
  expiresAt: '2029-02-08',
}

function sticker(label: string, fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><path fill="${fill}" d="M82 10c30 3 60 24 64 54 4 33-20 72-54 80C56 152 16 126 12 90 7 52 44 7 82 10z"/><text x="80" y="96" text-anchor="middle" font-size="28" font-weight="800" fill="#244812" font-family="sans-serif">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function piece(
  kind: YangguKind,
  label: string,
  date: string,
  time: string,
  area: string,
  title: string,
  lines: string[],
  tag: string,
  fill: string,
  id: string,
  extra?: { colors: ColorSwatch[]; thumb: string },
): YangguFragment {
  return {
    id,
    kind,
    label,
    sticker: sticker(label, fill),
    capturedAt: `${date}T${time}:00+09:00`,
    date,
    area,
    title,
    lines,
    tag,
    colors: extra?.colors,
    thumb: extra?.thumb,
  }
}

/** 최신순. 오늘(2026.08.27) 방문 + 군가족 반복 방문 6회 */
export const DEMO_FRAGMENTS: YangguFragment[] = [
  piece(
    'melon',
    '멜론',
    '2026-08-27',
    '16:21',
    '양구읍',
    '8월 27일 · 양구',
    ['오늘 양구에서 만난 건', '여름 끝자락의 멜론.', '집에 가져갈 양구 하나가 생겼다.'],
    '여름 · 양구읍 · 16:21',
    '#e7f3c9',
    'demo-20260827-melon',
    {
      thumb: '/assets/benefits/farm.jpg',
      colors: [
        { hex: '#c5d45a', name: '멜론 연두' },
        { hex: '#6f8f32', name: '양구 녹' },
      ],
    },
  ),
  piece(
    'bread',
    '빵',
    '2026-08-27',
    '15:40',
    '양구읍',
    '8월 27일 · 양구',
    ['집에 가져가는 양구가 하나 더 늘었다.', '포장된 온기가 가방 안에 있다.'],
    '여름 · 양구읍 · 15:40',
    '#f6e2c4',
    'demo-20260827-bread',
    {
      thumb: '/assets/benefits/baekkop.jpg',
      colors: [
        { hex: '#e0b070', name: '햇살' },
        { hex: '#8a5a32', name: '한과 갈색' },
      ],
    },
  ),
  piece(
    'coffee',
    '커피',
    '2026-08-27',
    '11:02',
    '양구읍',
    '8월 27일 · 양구',
    ['서두르지 않아도 되는 오후.', '잔이 식을 때까지 양구에 앉아 있었다.'],
    '여름 · 양구읍 · 11:02',
    '#ead7c4',
    'demo-20260827-coffee',
    {
      thumb: '/assets/benefits/terrace.jpg',
      colors: [
        { hex: '#6b4a32', name: '한과 갈색' },
        { hex: '#d8c4a8', name: '흙길' },
      ],
    },
  ),
  piece(
    'food',
    '식사',
    '2026-07-12',
    '12:40',
    '양구읍',
    '7월 12일 · 양구',
    ['양구에서 천천히 비운 그릇.', '배부른 오후가 남았다.'],
    '여름 · 양구읍 · 12:40',
    '#f3d5c4',
    'demo-20260712-food',
    {
      thumb: '/assets/benefits/yangguga.jpg',
      colors: [
        { hex: '#c45c3a', name: '노을 주황' },
        { hex: '#f0d9b8', name: '햇살' },
      ],
    },
  ),
  piece(
    'flower',
    '꽃',
    '2026-06-15',
    '15:18',
    '동면',
    '6월 15일 · 양구',
    ['길을 걷다 발길을 멈춘 자리.', '양구의 꽃 한 송이가 남았다.'],
    '여름 · 동면 · 15:18',
    '#f7eec0',
    'demo-20260615-flower',
    {
      thumb: '/assets/benefits/arboretum.jpg',
      colors: [
        { hex: '#e8d45c', name: '햇살' },
        { hex: '#d98aa8', name: '양구 꽃' },
      ],
    },
  ),
  piece(
    'mountain',
    '산',
    '2026-05-24',
    '10:05',
    '방산면',
    '5월 24일 · 양구',
    ['멀리 보이는 능선이 오늘은 가까웠다.', '양구의 공기가 사진 안에 있다.'],
    '봄 · 방산면 · 10:05',
    '#d7e6d4',
    'demo-20260524-mountain',
    {
      thumb: '/assets/benefits/dutayeon.jpg',
      colors: [
        { hex: '#5a7a62', name: '펀치볼 숲' },
        { hex: '#8ec3d0', name: '파로호' },
      ],
    },
  ),
  piece(
    'apple',
    '사과',
    '2026-04-19',
    '16:44',
    '양구읍',
    '4월 19일 · 양구',
    ['손에 들어온 양구의 계절.', '아삭한 한 입이 오늘을 기억한다.'],
    '봄 · 양구읍 · 16:44',
    '#f4d4d0',
    'demo-20260419-apple',
    {
      thumb: '/assets/benefits/hangwa.jpg',
      colors: [
        { hex: '#c4453a', name: '양구 사과' },
        { hex: '#f2e6d4', name: '양구 빛' },
      ],
    },
  ),
  piece(
    'family',
    '가족',
    '2026-03-21',
    '13:20',
    '양구읍',
    '3월 21일 · 양구',
    ['오늘 양구에서 마주 앉은 얼굴들.', '말보다 오래 남은 시간이 있다.'],
    '봄 · 양구읍 · 13:20',
    '#e8f0d8',
    'demo-20260321-family',
    {
      thumb: '/assets/benefits/farm.jpg',
      colors: [
        { hex: '#dce6c8', name: '양구 빛' },
        { hex: '#447e1d', name: '양구 녹' },
      ],
    },
  ),
  piece(
    'coffee',
    '커피',
    '2026-02-08',
    '14:11',
    '양구읍',
    '2월 8일 · 양구',
    ['군민증을 처음 꺼내 든 오후.', '양구에서의 시간이 여기서 시작됐다.'],
    '겨울 · 양구읍 · 14:11',
    '#ead7c4',
    'demo-20260208-coffee',
    {
      thumb: '/assets/benefits/punches.jpg',
      colors: [
        { hex: '#3d2a20', name: '밤 그림자' },
        { hex: '#7a9bb8', name: '하늘' },
      ],
    },
  ),
]

export function ensureDemoData() {
  try {
    if (localStorage.getItem(SEED_KEY) === SEED_VERSION) return
    localStorage.setItem(CITIZEN_KEY, JSON.stringify(DEMO_CITIZEN))
    localStorage.setItem(FRAGMENT_KEY, JSON.stringify(DEMO_FRAGMENTS))
    localStorage.setItem(SEED_KEY, SEED_VERSION)
  } catch {
    // 로컬 저장을 쓸 수 없으면 앱 초기값에서 다시 넣는다
  }
}
