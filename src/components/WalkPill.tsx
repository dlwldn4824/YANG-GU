import { Link, useLocation } from 'react-router-dom'
import { useDaySteps } from '../steps'

// 산책 중에 다른 화면에 있어도 걸음이 세지고 있다는 걸 보여 준다.
export function WalkPill() {
  const { walking, walkSteps } = useDaySteps()
  const { pathname } = useLocation()
  if (!walking || pathname === '/yanggu') return null

  return (
    <Link
      to="/yanggu"
      className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-main px-4 py-2 text-sm font-bold text-white shadow-lg lg:bottom-6"
    >
      산책 중 · {walkSteps.toLocaleString('ko-KR')}걸음
    </Link>
  )
}
