import { useEffect, useState } from 'react'
import { CITIZEN_COUNT } from '../data'
import { Icon } from './Icon'

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
      <div className="absolute inset-0 bg-gradient-to-r from-[#ecf2e8]/92 via-[#ecf2e8]/80 to-[#ecf2e8]/30" />
      <div className="relative wrap flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-14">
        <div className="flex flex-1 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div>
            <h1 className="font-display text-[32px] font-extrabold leading-[1.15] text-main lg:text-[44px]">
              양구사랑
              <br />
              사이버 군민증
            </h1>
            <p className="mt-3 text-sm text-gray-700 lg:text-base">양구와 관계를 맺는 가장 쉬운 방법</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-main px-6 py-4 text-white shadow-sm">
            <p className="text-[13px] font-medium">현재 사이버군민 수</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="text-[28px] font-extrabold tracking-tight">
                {count.toLocaleString('ko-KR')}
                <span className="ml-0.5 text-lg font-bold">명</span>
              </span>
              <Icon name="group" className="h-8 w-8 text-white" />
            </p>
          </div>
        </div>
        <img
          src="/assets/ui/hero-card.png"
          alt="양구사랑 사이버 군민증 배꼽친구"
          className="mx-auto h-36 w-auto drop-shadow-md sm:h-44 lg:mx-0 lg:h-52"
        />
      </div>
    </section>
  )
}
