import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { Icon } from './Icon'
import type { ComponentProps } from 'react'

const DESKTOP_NAV: { to: string; label: string; end: boolean }[] = [
  { to: '/', label: '소개', end: true },
  { to: '/comma', label: '쉼표', end: false },
  { to: '/benefits', label: '혜택', end: false },
  { to: '/card', label: '내 군민증', end: false },
  { to: '/issue', label: '발급', end: false },
  { to: '/faq', label: 'FAQ', end: false },
]

const MOBILE_NAV: { to: string; label: string; icon: ComponentProps<typeof Icon>['name']; end: boolean }[] = [
  { to: '/', label: '소개', icon: 'leaf', end: true },
  { to: '/comma', label: '쉼표', icon: 'clock', end: false },
  { to: '/benefits', label: '혜택', icon: 'percent', end: false },
  { to: '/card', label: '내 군민증', icon: 'id', end: false },
  { to: '/issue', label: '발급', icon: 'add', end: false },
]

export function Layout() {
  const { citizen, logout } = useAuth()
  const location = useLocation()
  const hideHero = location.pathname === '/present'

  if (hideHero) return <Outlet />

  return (
    <div className="min-h-dvh bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-main-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo />
          </NavLink>
          <nav className="hidden items-center gap-1 lg:flex">
            {DESKTOP_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive ? 'bg-main-50 text-main' : 'text-gray-600 hover:bg-gray-50'
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
                <span className="hidden max-w-28 truncate text-gray-600 sm:inline">{citizen.name} 님</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-50">
                  로그인
                </NavLink>
                <NavLink
                  to="/issue"
                  className="hidden rounded-full bg-main px-3.5 py-1.5 font-semibold text-white hover:bg-main-dark sm:inline-flex"
                >
                  발급받기
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <SiteFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-main-100 bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                  isActive ? 'text-main' : 'text-gray-400'
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-main text-sm font-extrabold text-white">
        양
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-tight text-main">
          양구 <span className="text-[#8bc34a]">DMO</span>
        </p>
        <p className="text-[10px] font-medium text-sub">사이버 군민증</p>
      </div>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-16 bg-main-50 px-4 py-10 text-sm text-gray-600">
      <div className="mx-auto max-w-6xl">
        <p className="font-extrabold text-main">양구 DMO</p>
        <div className="mt-4 space-y-1 leading-relaxed">
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
