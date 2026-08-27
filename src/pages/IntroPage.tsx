import { Link } from 'react-router-dom'
import { HeroBanner } from '../components/HeroBanner'
import { Icon } from '../components/Icon'
import { PickStories } from '../components/PickStories'
import { useAuth } from '../auth'
import type { ComponentProps } from 'react'

const STEPS: { num: string; icon: ComponentProps<typeof Icon>['name']; title: string }[] = [
  { num: '01', icon: 'id', title: '온라인을 통한 사이버 군민증 교부' },
  { num: '02', icon: 'gate', title: '입장료 및 관람료 군민 요금 적용' },
  { num: '03', icon: 'store', title: '파트너 업체 방문 시 할인 등 제공' },
  { num: '04', icon: 'message', title: '군의 다양한 소식을 온라인으로 제공' },
]

export function IntroPage() {
  const { citizen } = useAuth()

  return (
    <>
      <HeroBanner />
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <PickStories />
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <AxisCard kicker="발견" title="군민 PICK" line="지금 양구에서 해볼 만한 것" to="/pick/season" />
          <AxisCard kicker="머무름" title="군민 쉼표" line="서두르지 않아도 되는 이유" to="/comma" />
          <AxisCard kicker="기록" title="나의 양구" line="사진 한 장이 군민증이 됩니다" to="/card#yanggu" />
        </div>
        <Link
          to="/comma"
          className="mt-8 flex items-center justify-between rounded-2xl bg-main-50 px-5 py-4"
        >
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-sub">COMMA</p>
            <p className="mt-1 font-extrabold">오늘은 양구에서 조금 천천히</p>
            <p className="mt-1 text-sm text-gray-600">오래 머물기 좋은 군민 제휴 공간이 있어요</p>
          </div>
          <span className="text-sm font-bold text-main">내 주변 쉼표 보기</span>
        </Link>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-center text-sm tracking-[0.3em] text-sub">ㅡ 소개 ㅡ</p>
        <h2 className="mt-3 text-center text-2xl font-extrabold text-main lg:text-3xl">양구사랑 사이버 군민제도란?</h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[15px] leading-7 text-gray-600 lg:text-lg">
          국내·외의 남녀노소 누구나 사이버 양구군민에 등록이 되면 주민등록의 이전 없이도 사이버 양구군민이 되어
          관광지의 할인혜택, SMS를 통한 양구의 유용한 정보와 축제 및 관광정보 알리미 서비스 등 다양한 혜택을 누릴 수
          있는 제도입니다.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.num} className="rounded-2xl border border-main-100 bg-main-50/60 p-5">
              <span className="text-xs font-extrabold tracking-widest text-main">{step.num}</span>
              <p className="mt-3 text-[15px] font-bold leading-snug">{step.title}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <Link
            to={citizen ? '/card' : '/issue'}
            className="inline-flex items-center gap-1 rounded-full bg-main px-6 py-3 font-bold text-white hover:bg-main-dark"
          >
            {citizen ? '내 군민증 보기' : '군민증 발급하기'}
            <Icon name="right" className="h-5 w-5" />
          </Link>
        </div>

        <section className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold lg:text-3xl">
                <span className="text-main">양구사랑 사이버 군민증</span>을 발급받고,
                <br className="hidden sm:block" /> 다양한 혜택을 누려보세요!
              </h2>
              <p className="mt-3 text-gray-600">
                양구사랑 사이버 군민증을 발급하시면 양구군민과 일부 동일한 혜택을 누릴 수 있습니다.
              </p>
            </div>
            <Link to="/benefits" className="inline-flex items-center font-bold text-main">
              할인혜택 보러가기 <Icon name="right" className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <p className="text-sm font-bold text-point">혜택 {String(i + 1).padStart(2, '0')}</p>
                <Icon name={step.icon} className="mx-auto mt-4 h-10 w-10 text-main" />
                <p className="mt-4 font-semibold leading-snug">{step.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

function AxisCard({ kicker, title, line, to }: { kicker: string; title: string; line: string; to: string }) {
  return (
    <Link to={to} className="rounded-2xl border border-gray-100 p-4">
      <p className="text-[11px] font-bold tracking-[0.16em] text-sub">{kicker}</p>
      <p className="mt-1 font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{line}</p>
    </Link>
  )
}
