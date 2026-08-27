import { formatClock, localDateIso } from './utils'
import type { YangguFragment, YangguKind } from './types'

type KindMeta = {
  kind: YangguKind
  emoji: string
  label: string
  lines: string[]
}

const KINDS: KindMeta[] = [
  {
    kind: 'melon',
    emoji: '🍈',
    label: '멜론',
    lines: ['오늘 양구에서 만난 건', '여름 끝자락의 멜론.', '집에 가져갈 양구 하나가 생겼다.'],
  },
  {
    kind: 'coffee',
    emoji: '☕',
    label: '커피',
    lines: ['서두르지 않아도 되는 오후.', '잔이 식을 때까지 양구에 앉아 있었다.'],
  },
  {
    kind: 'bread',
    emoji: '🥐',
    label: '빵',
    lines: ['집에 가져가는 양구가 하나 더 늘었다.', '포장된 온기가 가방 안에 있다.'],
  },
  {
    kind: 'flower',
    emoji: '🌼',
    label: '꽃',
    lines: ['길을 걷다 발길을 멈춘 자리.', '양구의 꽃 한 송이가 남았다.'],
  },
  {
    kind: 'family',
    emoji: '👨‍👩‍👧',
    label: '가족',
    lines: ['오늘 양구에서 마주 앉은 얼굴들.', '말보다 오래 남은 시간이 있다.'],
  },
  {
    kind: 'mountain',
    emoji: '🏔️',
    label: '산',
    lines: ['멀리 보이는 능선이 오늘은 가까웠다.', '양구의 공기가 사진 안에 있다.'],
  },
  {
    kind: 'apple',
    emoji: '🍎',
    label: '사과',
    lines: ['손에 들어온 양구의 계절.', '아삭한 한 입이 오늘을 기억한다.'],
  },
  {
    kind: 'food',
    emoji: '🍲',
    label: '식사',
    lines: ['양구에서 천천히 비운 그릇.', '배부른 오후가 남았다.'],
  },
]

export async function readPhotoAsFragment(file: File): Promise<YangguFragment> {
  const image = await loadImage(file)
  const sample = sampleImage(image)
  const meta = pickKind(sample)
  const sticker = makeSticker(image, sample)
  const now = new Date()
  const date = localDateIso(now)
  const clock = formatClock(now)
  const month = now.getMonth() + 1
  const day = now.getDate()
  const season = month <= 2 || month === 12 ? '겨울' : month <= 5 ? '봄' : month <= 8 ? '여름' : '가을'

  return {
    id: `${now.getTime()}`,
    kind: meta.kind,
    emoji: meta.emoji,
    label: meta.label,
    sticker,
    capturedAt: now.toISOString(),
    date,
    area: '양구읍',
    title: `${month}월 ${day}일 · 양구`,
    lines: meta.lines,
    tag: `${meta.emoji} ${season} · 양구읍 · ${clock}`,
  }
}

type Sample = {
  hue: number
  sat: number
  light: number
  warmth: number
  green: number
  skin: number
  centerX: number
  centerY: number
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('사진을 읽지 못했습니다.'))
    }
    image.src = url
  })
}

function sampleImage(image: HTMLImageElement): Sample {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { hue: 90, sat: 0.3, light: 0.5, warmth: 0, green: 0, skin: 0, centerX: 0.5, centerY: 0.5 }
  ctx.drawImage(image, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  let h = 0
  let s = 0
  let l = 0
  let warmth = 0
  let green = 0
  let skin = 0
  let weightX = 0
  let weightY = 0
  let weight = 0
  const count = size * size
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const hsl = rgbToHsl(r, g, b)
    h += hsl.h
    s += hsl.s
    l += hsl.l
    warmth += r - b
    if (g > r && g > b) green += 1
    if (r > 0.35 && r > g && g > b && r - g < 0.35) skin += 1
    const sat = hsl.s
    const px = (i / 4) % size
    const py = Math.floor(i / 4 / size)
    weightX += px * sat
    weightY += py * sat
    weight += sat
  }
  return {
    hue: h / count,
    sat: s / count,
    light: l / count,
    warmth: warmth / count,
    green: green / count,
    skin: skin / count,
    centerX: weight > 0.01 ? weightX / weight / size : 0.5,
    centerY: weight > 0.01 ? weightY / weight / size : 0.45,
  }
}

function pickKind(sample: Sample): KindMeta {
  if (sample.skin > 0.12 && sample.sat < 0.45) return kindById('family')
  if (sample.green > 0.28 && sample.hue > 70 && sample.hue < 150) {
    if (sample.light > 0.55 && sample.hue < 110) return kindById('melon')
    if (sample.sat > 0.35 && sample.light > 0.45) return kindById('flower')
    return kindById('mountain')
  }
  if (sample.hue > 80 && sample.hue < 140 && sample.light > 0.5) return kindById('melon')
  if (sample.warmth > 0.12 && sample.hue < 50 && sample.light < 0.45) return kindById('coffee')
  if (sample.warmth > 0.08 && sample.light > 0.55 && sample.hue < 60) return kindById('bread')
  if (sample.hue < 20 && sample.sat > 0.35) return kindById('apple')
  if (sample.warmth > 0.05 && sample.light < 0.55) return kindById('food')
  if (sample.light < 0.4) return kindById('coffee')
  return kindById('flower')
}

function kindById(kind: YangguKind) {
  return KINDS.find((item) => item.kind === kind) ?? KINDS[0]
}

function makeSticker(image: HTMLImageElement, sample: Sample) {
  const size = 160
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.toDataURL('image/png')

  const crop = Math.min(image.width, image.height) * 0.72
  const sx = Math.max(0, Math.min(image.width - crop, image.width * sample.centerX - crop / 2))
  const sy = Math.max(0, Math.min(image.height - crop, image.height * sample.centerY - crop / 2))
  ctx.drawImage(image, sx, sy, crop, crop, 0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const { data } = imageData
  const corner = averageCorners(data, size)
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor(i / 4 / size)
    const nx = (x / size) * 2 - 1
    const ny = (y / size) * 2 - 1
    const blob =
      nx * nx * 0.72 +
      ny * ny * 0.9 +
      0.08 * Math.sin(x / 9) +
      0.07 * Math.cos(y / 8)
    const dist = colorDist(data[i], data[i + 1], data[i + 2], corner)
    let alpha = dist > 46 ? 255 : Math.max(0, (dist - 22) * 10)
    if (blob > 1) alpha = 0
    else if (blob > 0.82) alpha = Math.min(alpha, (1 - blob) * 1400)
    data[i + 3] = alpha
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function averageCorners(data: Uint8ClampedArray, size: number) {
  const pts = [
    [4, 4],
    [size - 5, 4],
    [4, size - 5],
    [size - 5, size - 5],
  ]
  let r = 0
  let g = 0
  let b = 0
  for (const [x, y] of pts) {
    const i = (y * size + x) * 4
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  return { r: r / 4, g: g / 4, b: b / 4 }
}

function colorDist(r: number, g: number, b: number, corner: { r: number; g: number; b: number }) {
  return Math.hypot(r - corner.r, g - corner.g, b - corner.b)
}

function rgbToHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: h * 60, s, l }
}
