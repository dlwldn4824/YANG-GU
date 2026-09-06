import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, type ComponentProps } from 'react'
import { useAuth } from '../auth'
import { BAEKKOBI_SRC } from '../companion'
import { Icon } from './Icon'

const DESKTOP_NAV: { to: string; label: string }[] = [
  { to: '/', label: '홈' },
  { to: '/pick', label: '추천' },
  { to: '/nearby', label: '제휴지도' },
  { to: '/yanggu', label: '배꼬비' },
  { to: '/card', label: '내 군민증' },
]

const MOBILE_NAV: {
  to: string
  label: string
  icon?: ComponentProps<typeof Icon>['name']
  image?: string
}[] = [
  { to: '/', label: '홈', icon: 'leaf' },
  { to: '/pick', label: '추천', icon: 'gift' },
  { to: '/nearby', label: '제휴지도', icon: 'pin' },
  { to: '/yanggu', label: '배꼬비', image: BAEKKOBI_SRC },
  { to: '/card', label: '내 군민증', icon: 'id' },
]

function isNavActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  if (to === '/pick') return pathname === '/pick' || pathname.startsWith('/pick/')
  return pathname === to
}

export function Layout() {
  const { citizen, logout } = useAuth()
  const location = useLocation()
  const hideChrome = location.pathname === '/present'

  useEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  if (hideChrome) return <Outlet />

  return (
    <div className="min-h-dvh bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-main-100 bg-white/95 backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo />
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex">
            {DESKTOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={() =>
                  `rounded-full px-3.5 py-2 text-sm font-semibold ${
                    isNavActive(location.pathname, item.to) ? 'bg-main-50 text-main' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            {citizen ? (
              <>
                <NavLink
                  to="/card"
                  title="내 군민증"
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 font-medium ${
                    isNavActive(location.pathname, '/card')
                      ? 'bg-main-50 text-main'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon name="user" className="h-5 w-5" />
                  <span className="hidden max-w-28 truncate sm:inline">{citizen.name} 님</span>
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 font-medium text-gray-600 hover:bg-gray-50"
              >
                <Icon name="user" className="h-5 w-5" />
                <span className="hidden sm:inline">로그인</span>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <SiteFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-main-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map((item) => {
            const active = isNavActive(location.pathname, item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                  active ? 'text-main' : 'text-gray-400'
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className={`h-5 w-5 object-contain ${active ? '' : 'opacity-45 grayscale'}`}
                  />
                ) : (
                  <Icon name={item.icon!} className="h-5 w-5" />
                )}
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/assets/ui/dmo-logo.png" alt="양구 DMO" className="h-9 w-auto sm:h-10" />
      <span className="hidden text-[11px] font-bold text-sub sm:inline">사이버 군민증</span>
    </span>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-16 bg-main-50 py-10 text-sm text-gray-600">
      <div className="wrap">
        <img src="/assets/ui/dmo-logo.png" alt="양구 DMO" className="h-10 w-auto" />
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-main">
          <NavLink to="/pick">추천</NavLink>
          <NavLink to="/nearby">제휴지도</NavLink>
          <NavLink to="/yanggu">배꼬비</NavLink>
          <NavLink to="/card">내 군민증</NavLink>
          <NavLink to="/faq">FAQ</NavLink>
        </nav>
        <div className="mt-6 space-y-1 leading-relaxed">
          <p>
            <b className="text-ink">상호명</b> 사회적기업 (주)공감만세 · <b className="text-ink">대표</b> 고두환
          </p>
          <p>
            <b className="text-ink">TEL</b> 02-2135-3611 · <b className="text-ink">EMAIL</b> gonggam@fairtravelkorea.com
          </p>
          <p>본사: 서울특별시 마포구 동교로 128 진영빌딩 B동 6층</p>
          <p>지사: 강원도 양구군 양구읍 중심로 216</p>
        </div>
        <p className="mt-6 text-xs text-gray-500">Copyright 2026. 양구DMO. All rights reserved.</p>
      </div>
    </footer>
  )
}
