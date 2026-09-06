import { useEffect, useState } from 'react'
import { CITIZEN_COUNT } from '../data'

export function HeroBanner() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setCount(Math.round(CITIZEN_COUNT * (1 - (1 - t) ** 3)))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-[#eef6e7]"
      style={{ backgroundImage: 'url(/assets/ui/hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#ecf2e8]/90 via-[#ecf2e8]/70 to-transparent" />
      <div className="relative wrap py-10 lg:py-16">
        <p className="text-[11px] font-bold tracking-[0.2em] text-sub">YANGGU CYBER CITIZEN</p>
        <h1 className="mt-2 text-[32px] font-extrabold leading-tight text-ink lg:text-5xl">
          양구사랑
          <br />
          사이버 군민증
        </h1>
        <p className="mt-3 text-base text-gray-600 lg:text-lg">양구와 관계를 맺는 가장 쉬운 방법</p>
        <div className="mt-6 inline-flex items-baseline gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium whitespace-nowrap text-gray-500">현재 사이버군민 수</p>
          <p className="flex items-baseline gap-0.5">
            <span className="text-3xl font-extrabold tracking-tight text-main">
              {count.toLocaleString('ko-KR')}
            </span>
            <span className="text-sm font-semibold text-gray-500">명</span>
          </p>
        </div>
        <img
          src="/assets/ui/hero-card.png"
          alt="양구사랑 사이버 군민증 배꼽친구"
          className="mx-auto mt-8 h-40 w-auto drop-shadow-md lg:h-56"
        />
      </div>
    </section>
  )
}
