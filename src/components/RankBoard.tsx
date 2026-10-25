import { Link } from 'react-router-dom'
import type { MyRank, Ranker } from '../rank'
import { CompanionSprite } from './CompanionSprite'

type Props = {
  id: string
  joined: boolean
  top: Ranker[]
  me: MyRank | null
  error: string
  myName: string
  myLevel: number
}

export function RankBoard({ id, joined, top, me, error, myName, myLevel }: Props) {
  const shown = top.slice(0, 10)
  const meShown = shown.some((item) => item.id === id)

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-xl font-extrabold">배꼬비 랭킹</h2>
        {me && joined ? <p className="text-sm font-bold text-main">내 순위 {me.rank}위</p> : null}
      </div>

      {!joined ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to="/signup?next=/yanggu"
            className="rounded-2xl bg-main px-4 py-3 text-center text-sm font-bold text-white"
          >
            가입하고 랭킹 참가
          </Link>
          <Link
            to="/login?next=/yanggu"
            className="rounded-2xl border border-main px-4 py-3 text-center text-sm font-bold text-main"
          >
            로그인
          </Link>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-xs text-gray-500">{error}</p> : null}

      {shown.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {shown.map((item) => (
            <RankRow key={item.id} item={item} mine={item.id === id} />
          ))}
          {joined && me && !meShown ? (
            <RankRow item={{ id, rank: me.rank, name: myName, level: myLevel, xp: me.xp }} mine />
          ) : null}
        </ol>
      ) : !error ? (
        <p className="mt-3 text-sm text-gray-500">아직 랭커가 없어요. 첫 번째가 되어 보세요!</p>
      ) : null}
    </section>
  )
}

function RankRow({ item, mine }: { item: Ranker; mine: boolean }) {
  const medal = ['🥇', '🥈', '🥉'][item.rank - 1]
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${mine ? 'border-main bg-main-50' : 'border-gray-100 bg-white'}`}
    >
      <span className="w-7 text-center text-sm font-extrabold">{medal ?? item.rank}</span>
      <CompanionSprite level={item.level} className="h-10 w-10 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">
          {item.name}
          {mine ? <span className="ml-1 text-xs text-main">(나)</span> : null}
        </span>
        <span className="text-xs text-gray-500">Lv.{item.level}</span>
      </span>
      <span className="text-sm font-bold text-gray-700">{item.xp.toLocaleString('ko-KR')}</span>
    </li>
  )
}
