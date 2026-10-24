import type { Growth } from '../raise'
import { CompanionSprite } from './CompanionSprite'

export function GrowthBar({ growth, progress }: { growth: Growth; progress?: number }) {
  const value = progress ?? growth.progress
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span>경험치 {growth.xp.toLocaleString('ko-KR')}</span>
        <span className="text-gray-500">
          {growth.maxed ? '최고 레벨!' : `다음 레벨까지 ${growth.toNext.toLocaleString('ko-KR')}`}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-main transition-[width] duration-1000 ease-out"
          style={{ width: `${Math.max(4, Math.round(value * 100))}%` }}
        />
      </div>
    </div>
  )
}

export function LevelUpModal({ growth, onClose }: { growth: Growth; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label="레벨 업"
        className="kkobi-pop w-full max-w-xs rounded-3xl bg-white px-6 py-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-extrabold tracking-[0.2em] text-point">LEVEL UP!</p>
        <CompanionSprite level={growth.level} className="kkobi-hop mx-auto mt-3 h-40 w-40" />
        <p className="font-display mt-3 text-2xl font-extrabold">Lv.{growth.level}</p>
        <p className="mt-1 font-bold text-main">{growth.name}로 자랐어요</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-main py-3 text-sm font-bold text-white"
        >
          좋아!
        </button>
      </div>
    </div>
  )
}
