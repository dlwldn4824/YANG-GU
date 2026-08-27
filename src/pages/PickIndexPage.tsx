import { Link } from 'react-router-dom'
import { WEEKLY_PICKS } from '../data/picks'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'

export function PickIndexPage() {
  return (
    <>
      <PageHeader kicker="PICK" title="이번 주 군민 PICK" desc="지금 양구에서 해볼 만한 것" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ul className="grid gap-5 sm:grid-cols-2">
          {WEEKLY_PICKS.map((story) => (
            <li key={story.id}>
              <Link
                to={`/pick/${story.id}`}
                className="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_24px_rgba(34,70,16,0.06)]"
              >
                <div className="relative aspect-[16/9] bg-main-50">
                  <img src={story.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-main">
                    {story.weekLabel}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-extrabold leading-snug">{story.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{story.line}</p>
                  <p className="mt-3 text-sm font-bold text-main">
                    {story.partnerIds.length}곳 동선 · 이동시간 · 예상 비용
                    <Icon name="right" className="ml-1 inline h-4 w-4" />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
