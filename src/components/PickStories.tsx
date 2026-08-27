import { Link } from 'react-router-dom'
import { WEEKLY_PICKS } from '../data/picks'
import { Icon } from './Icon'

export function PickStories() {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-sub">EDITOR PICK</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink lg:text-2xl">이번 주 군민 PICK</h2>
          <p className="mt-1 text-sm text-gray-500">지금 양구에서 해볼 만한 것</p>
        </div>
        <Link to="/comma" className="shrink-0 text-sm font-bold text-main">
          쉼표 <Icon name="right" className="inline h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
        {WEEKLY_PICKS.map((story) => (
          <Link
            key={story.id}
            to={`/pick/${story.id}`}
            className="w-[78vw] max-w-xs shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_24px_rgba(34,70,16,0.06)]"
          >
            <div className="relative aspect-[16/9] bg-main-50">
              <img src={story.image} alt="" className="h-full w-full object-cover" />
              <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-main">
                {story.weekLabel}
              </span>
            </div>
            <div className="p-4">
              <p className="text-lg font-extrabold leading-snug">
                {story.emoji} {story.title}
              </p>
              <p className="mt-1 text-sm text-gray-600">{story.line}</p>
              <p className="mt-3 text-sm font-bold text-main">
                관련 제휴 {story.partnerIds.length}곳 · 혜택과 거리 보기
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
