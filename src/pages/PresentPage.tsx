import { Link } from 'react-router-dom'
import { CitizenCard } from '../components/CitizenCard'
import { useAuth } from '../auth'

export function PresentPage() {
  const { citizen } = useAuth()

  if (!citizen) {
    return (
      <div className="grid min-h-dvh place-items-center bg-main px-4 text-center text-white">
        <div>
          <p className="text-lg font-bold">제시할 군민증이 없습니다</p>
          <Link to="/issue" className="mt-6 inline-block rounded-full bg-white px-5 py-2 font-bold text-main">
            발급하러 가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#1b320c] px-4 py-6 text-white">
      <div className="flex items-center justify-between">
        <Link to="/card" className="rounded-full bg-white/10 px-3 py-1.5 text-sm">
          닫기
        </Link>
        <p className="text-sm font-semibold tracking-wide">매장 제시 모드</p>
        <span className="w-12" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="mb-4 text-center text-sm text-white/80">이 화면과 신분증을 함께 보여주세요</p>
        <CitizenCard citizen={citizen} />
        <p className="mt-6 text-center text-lg font-extrabold">{citizen.name}</p>
        <p className="mt-1 text-sm text-white/70">{citizen.cardNo}</p>
      </div>
    </div>
  )
}
