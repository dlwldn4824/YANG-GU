export type Category = '전체' | '관광지' | '카페' | '체험' | '숙박' | '기타'

export type Benefit = {
  id: string
  title: string
  category: Exclude<Category, '전체'>
  image: string | null
  link: string
  location: string
  item: string
  discount: string
  howto: string
  phone?: string
}

export type CardDesign = 1 | 2 | 3 | 4

export type GeoPoint = {
  lat: number
  lng: number
}

export type PartnerGeo = GeoPoint

export type PickStory = {
  id: string
  weekLabel: string
  emoji: string
  title: string
  line: string
  image: string
  partnerIds: string[]
  linger?: boolean
}

export type CommaMood = 'book' | 'window' | 'family' | 'walk'

export type CommaSpace = {
  partnerId: string
  mood: CommaMood
  vibe: string
  stayPerk: string
  sample?: {
    emoji: string
    name: string
    line: string
    shopId: string
  }
}

export type YangguKind = 'melon' | 'coffee' | 'bread' | 'flower' | 'family' | 'mountain' | 'apple' | 'food'

export type YangguFragment = {
  id: string
  kind: YangguKind
  emoji: string
  label: string
  sticker: string
  capturedAt: string
  date: string
  area: string
  title: string
  lines: string[]
  tag: string
}

export type Citizen = {
  name: string
  email: string
  password: string
  phone: string
  birth: string
  zip: string
  address: string
  detailAddress: string
  design: CardDesign
  visitCount: string
  visitPurpose: string
  emailAgree: boolean
  smsAgree: boolean
  issuedAt: string
  cardNo: string
  expiresAt: string
}
