import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PageHeader } from '../components/PageHeader'
import { CitizenCard } from '../components/CitizenCard'
import { BenefitCard } from '../components/BenefitCard'
import { PickStories } from '../components/PickStories'
import { MyYanggu } from '../components/MyYanggu'
import { Icon } from '../components/Icon'
import { useAuth } from '../auth'
import { useJournal } from '../journal'
import { BENEFITS } from '../data'
import { formatDate } from '../utils'

export function MyCardPage() {
  const { citizen } = useAuth()
  const { fragments } = useJournal()
  const location = useLocation()

  useEffect(() => {
    if (location.hash !== '#yanggu') return
    document.getElementById('yanggu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <>
      <PageHeader
        kicker="MY CARD"
        title={citizen ? '내 양구사랑 사이버 군민증' : '내 양구사랑 사이버 군민증을 발급 받아보세요!'}
        desc="양구사랑 사이버 군민증을 발급받고, 다양한 혜택을 누려보세요"
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid items-start gap-10 lg:grid-cols-[320px_1fr]">
          <CitizenCard citizen={citizen} fragments={fragments} showCollection />
          <div>
            <div className="flex items-center gap-2">
              <img src="/assets/ui/info-icon.png" alt="" className="h-8 w-8" />
              <h3 className="text-2xl font-extrabold text-sub">안내</h3>
            </div>
            <p className="mt-5 text-[15px] font-semibold leading-7">
              양구사랑 사이버 군민증은 모바일이나 인쇄된 이미지로 사용할 수 있으며 신분을 확인할 수 있는
              신분증(주민등록증 or 운전면허증 or 여권)과 함께 보여줘야 합니다.
            </p>
            <div className="my-5 h-px bg-gray-200" />
            <p className="text-gray-600">
              사이버 양구군민이 되어 양구 관광지·음식점·카페 등 다양한 할인 혜택을 만나보세요!
            </p>

            {citizen ? (
              <div className="mt-6 rounded-2xl bg-main-50 p-4 text-sm">
                <p>
                  <b>발급번호</b> {citizen.cardNo}
                </p>
                <p className="mt-1">
                  <b>발급일</b> {formatDate(citizen.issuedAt)} · <b>유효기간</b> {formatDate(citizen.expiresAt)}
                </p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:max-w-sm">
              {citizen ? (
                <>
                  <Link
                    to="/present"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-main py-3 font-bold text-white hover:bg-main-dark"
                  >
                    매장에서 제시하기 <Icon name="scan" className="h-5 w-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-main py-3 font-bold text-main"
                  >
                    사이버 군민증 인쇄 <Icon name="printer" className="h-5 w-5" />
                  </button>
                  <a
                    href={`/assets/cards/front${citizen.design}.jpg`}
                    download="yanggu-cyber-card.jpg"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3 font-bold text-gray-700"
                  >
                    이미지 다운로드 <Icon name="download" className="h-5 w-5" />
                  </a>
                </>
              ) : (
                <Link
                  to="/issue"
                  className="inline-flex items-center justify-center rounded-full bg-main py-3 font-bold text-white hover:bg-main-dark"
                >
                  지금 발급받기
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="mt-16">
          <MyYanggu />
        </div>

        <div className="mt-16">
          <PickStories />
        </div>

        <section className="mt-16">
          <h3 className="text-center text-2xl font-extrabold text-sub">양구사랑 사이버 군민증 혜택</h3>
          <p className="mt-3 text-center text-gray-600">다양한 할인 혜택을 확인해보세요!</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.slice(0, 6).map((item) => (
              <BenefitCard key={item.id} benefit={item} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/benefits" className="inline-flex items-center font-bold text-main">
              혜택 전체 보기 <Icon name="right" className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
