import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BOOTHS, boothById } from '../data/booths'
import { XP, growthFromXp, useBaekkobi, type VisitResult } from '../raise'
import { useDaySteps } from '../steps'
import { CompanionSprite } from '../components/CompanionSprite'
import { GrowthBar, LevelUpModal } from '../components/GrowthPanel'
import { useRanking } from '../rank'

// 부스 QR을 찍으면 열리는 화면: /q/:boothId
export function ScanPage() {
  const { boothId } = useParams()
  const booth = boothById(boothId)
  const { totalSteps } = useDaySteps()
  const { growth, recordVisit, visitedToday, levelUp, ackLevelUp } = useBaekkobi(totalSteps)
  const { joined, me } = useRanking(growth.xp, growth.level)
  const [result, setResult] = useState<VisitResult | null>(null)
  const [barFrom, setBarFrom] = useState<number | null>(null)
  const [settled, setSettled] = useState(false)
  const recorded = useRef(false)

  // 바가 다 차오른 뒤에 레벨업을 띄운다.
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!booth || recorded.current) return
    recorded.current = true
    const outcome = recordVisit(booth.id)
    setResult(outcome)
    if (outcome === 'new') {
      // 경험치 바가 이전 값에서 차오르도록 한 박자 늦게 채운다.
      const before = growthFromXp(growth.xp)
      setBarFrom(before.level === growthFromXp(growth.xp + XP.visit).level ? before.progress : 0)
      window.setTimeout(() => setBarFrom(null), 350)
    }
  }, [booth, recordVisit, growth.xp])

  if (!booth) {
    return (
      <main className="wrap py-10 text-center">
        <CompanionSprite level={1} className="mx-auto h-32 w-32" />
        <h1 className="font-display mt-4 text-2xl font-extrabold">어떤 부스인지 모르겠어요</h1>
        <p className="mt-2 text-sm text-gray-600">QR을 다시 찍어 주세요.</p>
        <Link to="/yanggu" className="mt-6 inline-block rounded-full bg-main px-5 py-3 text-sm font-bold text-white">
          배꼬비 보러 가기
        </Link>
      </main>
    )
  }

  const others = BOOTHS.filter((item) => item.id !== booth.id)

  return (
    <main className="wrap py-8">
      <section className="rounded-3xl bg-main-50 px-5 py-7 text-center">
        <p className="kkobi-pop text-sm font-extrabold text-point">
          {result === 'again' ? '또 와줬구나!' : `+${XP.visit} 경험치 · 먹이 1개`}
        </p>
        <h1 className="font-display kkobi-pop mt-1 text-3xl font-extrabold">오늘도 양구 탐험중!</h1>
        <CompanionSprite level={growth.level} className="kkobi-hop mx-auto mt-4 h-44 w-44" />
        <p className="font-display mt-2 text-lg font-extrabold">
          Lv.{growth.level} {growth.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-main">
          {result === 'again'
            ? '이 부스는 오늘 이미 들렀어요. 다른 부스도 찾아볼까?'
            : `${booth.name}에 들러서 배꼬비가 한 뼘 자랐어요.`}
        </p>
        <div className="mt-5 text-left">
          <GrowthBar growth={growth} progress={barFrom ?? undefined} />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          오늘 들른 부스 {visitedToday.length}곳 · 누적 {totalSteps.toLocaleString('ko-KR')}걸음
          {joined && me ? ` · 랭킹 ${me.rank}위` : ''}
        </p>
      </section>

      <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5">
        <p className="text-sm font-bold text-sub">{booth.spot}</p>
        <h2 className="font-display mt-1 text-2xl font-extrabold">{booth.name}</h2>
        <p className="mt-1 text-sm font-semibold text-gray-500">{booth.host}</p>
        <p className="mt-3 text-sm leading-6 text-gray-700">{booth.line}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {booth.items.map((item) => (
            <li key={item} className="rounded-full bg-main-50 px-3 py-1 text-sm font-bold text-main">
              {item}
            </li>
          ))}
        </ul>
      </section>

      {others.length > 0 ? (
        <section className="mt-5">
          <p className="text-sm font-bold">다른 부스도 찍어 보세요</p>
          <ul className="mt-3 space-y-2">
            {others.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                <span>
                  <span className="text-sm font-extrabold">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{item.spot}</span>
                </span>
                <span className="text-xs font-bold text-main">
                  {visitedToday.includes(item.id) ? '들렀어요' : `+${XP.visit}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        to="/yanggu"
        className="mt-6 block rounded-2xl bg-main py-3 text-center text-sm font-bold text-white"
      >
        배꼬비 키우러 가기
      </Link>

      {levelUp && settled ? <LevelUpModal growth={levelUp} onClose={ackLevelUp} /> : null}
    </main>
  )
}
