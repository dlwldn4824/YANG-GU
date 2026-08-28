import { Link } from 'react-router-dom'
import { HeroBanner } from '../components/HeroBanner'
import { Icon } from '../components/Icon'
import { useAuth } from '../auth'

const MENU = [
  { to: '/pick', title: '추천', line: '이번 주 양구에서 해볼 만한 것' },
  { to: '/nearby', title: '지도', line: '제휴 매장과 오래 머물 곳' },
  { to: '/food', title: '음식점', line: '양구볼구양에 있는 먹을 곳' },
  { to: '/yanggu', title: '기록', line: '사진으로 남긴 양구 방문' },
  { to: '/card', title: '내 군민증', line: '카드 제시와 오늘의 기록' },
]

export function IntroPage() {
  const { citizen } = useAuth()

  return (
    <>
      <HeroBanner />
      <main className="wrap py-10">
        <p className="text-sm font-bold text-sub">바로 가기</p>
        <h2 className="font-display mt-1 text-2xl font-extrabold">무엇을 할까요?</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {MENU.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(34,70,16,0.04)]"
              >
                <span>
                  <span className="font-display block text-lg font-extrabold">{item.title}</span>
                  <span className="mt-1 block text-sm text-gray-500">{item.line}</span>
                </span>
                <Icon name="right" className="h-5 w-5 text-main" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-center text-sm tracking-[0.3em] text-sub">ㅡ 소개 ㅡ</p>
        <h2 className="mt-3 text-center text-2xl font-extrabold text-main lg:text-3xl">양구사랑 사이버 군민제도란?</h2>
        <p className="mx-auto mt-5 max-w-3xl text-center text-[15px] leading-7 text-gray-600 lg:text-lg">
          국내·외의 남녀노소 누구나 사이버 양구군민에 등록이 되면 주민등록의 이전 없이도 사이버 양구군민이 되어
          관광지의 할인혜택, SMS를 통한 양구의 유용한 정보와 축제 및 관광정보 알리미 서비스 등 다양한 혜택을 누릴 수
          있는 제도입니다.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={citizen ? '/card' : '/login'}
            className="inline-flex items-center gap-1 rounded-full bg-main px-6 py-3 font-bold text-white hover:bg-main-dark"
          >
            {citizen ? '내 군민증 보기' : '로그인'}
            <Icon name="right" className="h-5 w-5" />
          </Link>
          <Link
            to="/benefits"
            className="inline-flex items-center rounded-full border border-main px-6 py-3 font-bold text-main"
          >
            제휴 혜택 보기
          </Link>
        </div>
      </main>
    </>
  )
}
