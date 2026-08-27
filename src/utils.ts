import type { Benefit } from './types'

export function linkLabel(url: string) {
  if (!url) return null
  if (url.includes('map.naver.com')) return '지도 보기'
  if (url.includes('instagram.com')) return '인스타그램'
  if (url.includes('blog.naver.com') || url.includes('m.blog.naver')) return '블로그'
  return '홈페이지'
}

export function mapUrl(location: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(location)}`
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${y}.${m}.${d}`
}

export function formatBirth(iso: string) {
  return iso.replaceAll('-', '/')
}

export function makeCardNo() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `YG-${new Date().getFullYear()}-${n}`
}

export function addYears(iso: string, years: number) {
  const date = new Date(iso)
  date.setFullYear(date.getFullYear() + years)
  return date.toISOString().slice(0, 10)
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function localDateIso(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatClock(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatMonthLabel(iso: string) {
  const [year, month] = iso.split('-')
  return `${year}.${month}`
}

export function formatDuration(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}분`
  return `${hours}시간 ${rest}분`
}

export function categoryEmoji(category: Benefit['category']) {
  if (category === '카페') return '☕'
  if (category === '관광지') return '🏞'
  if (category === '체험') return '🎨'
  if (category === '숙박') return '🏡'
  return '🎁'
}

/** 입장료처럼 원 단위가 명시된 혜택만 절약액을 계산한다. */
export function parseKnownSaving(discount: string) {
  const match = discount.match(/기존\s*([\d,]+)원\s*→\s*사이버군민\s*([\d,]+)원/)
  if (!match) return null
  const from = Number(match[1].replaceAll(',', ''))
  const to = Number(match[2].replaceAll(',', ''))
  if (!from || to >= from) return null
  return { bill: from, saving: from - to }
}

export function usageBadge(benefit: Benefit) {
  if (benefit.howto.includes('전화')) return '전화 예약'
  if (benefit.howto.includes('사전예약')) return '사전 예약'
  return '현장 제시'
}
