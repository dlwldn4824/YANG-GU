import { BENEFITS } from '../data'
import type { FoodKind, FoodPlace, FoodRegion } from '../types'
import raw from './foodPlaces.json' with { type: 'json' }

export const FOOD_KINDS = ['전체', '한식', '중식', '일식', '양식', '분식', '카페', '치킨', '기타'] as const

export const FOOD_REGIONS: FoodRegion[] = ['양구읍', '국토정중앙면', '동면', '방산면', '해안면']

type FoodPlaceRaw = {
  id: string
  placeNo: number
  title: string
  address: string
  image: string | null
  tags: string[]
  phone: string | null
  cuisine: string | null
  lat: number | null
  lon: number | null
  summary: string | null
  link: string
  hours: string | null
}

function collapse(value: string) {
  return value.replace(/[\s"'“”‘’`"()[\].,·-]/g, '').replace(/佳/g, '가').toLowerCase()
}

const BENEFIT_INDEX = BENEFITS.map((item) => ({
  id: item.id,
  title: collapse(item.title),
  location: collapse(item.location),
}))

function matchBenefit(title: string, address: string) {
  const name = collapse(title)
  const loc = collapse(address)
  const hit = BENEFIT_INDEX.find((item) => {
    if (name && name === item.title) return true
    const longEnough = name.length >= 6 && item.title.length >= 6
    if (longEnough && (name.includes(item.title) || item.title.includes(name))) return true
    if (loc.length >= 12 && item.location.length >= 12 && (loc.includes(item.location) || item.location.includes(loc))) {
      return true
    }
    return false
  })
  return hit?.id
}

function regionOf(address: string): FoodRegion | null {
  return FOOD_REGIONS.find((region) => address.includes(region)) ?? null
}

function kindOf(title: string, cuisine: string | null, tags: string[]): FoodKind {
  const blob = `${cuisine ?? ''} ${tags.join(' ')} ${title}`
  if (/치킨|통닭|닭강정/.test(blob)) return '치킨'
  if (/카페|커피/.test(blob)) return '카페'
  if (/분식|김밥|떡볶이/.test(blob)) return '분식'
  if (/중식|짜장|짬뽕|중국/.test(blob)) return '중식'
  if (/일식|초밥|라멘|우동/.test(blob)) return '일식'
  if (/양식|피자|파스타|버거|이탈|레스토랑/.test(blob)) return '양식'
  if (/한식/.test(blob)) return '한식'
  return '기타'
}

function clean(value: string | null | undefined) {
  const next = value?.replace(/\ufeff/g, '').trim()
  return next || undefined
}

export const FOOD_PLACES: FoodPlace[] = (raw as FoodPlaceRaw[]).map((item) => {
  const title = item.title.replace(/\ufeff/g, '').trim()
  const address = item.address.trim()
  return {
    id: item.id,
    placeNo: item.placeNo,
    title,
    address,
    image: item.image,
    tags: item.tags.filter((tag) => tag && tag !== '맛집' && tag !== '음식점' && tag !== '음식' && tag !== '양구맛집' && tag !== '양구음식점'),
    phone: clean(item.phone),
    cuisine: clean(item.cuisine),
    hours: clean(item.hours),
    summary: clean(item.summary),
    link: item.link,
    kind: kindOf(title, item.cuisine, item.tags),
    region: regionOf(address),
    point: item.lat != null && item.lon != null ? { lat: item.lat, lng: item.lon } : null,
    benefitId: matchBenefit(title, address),
  }
})
