import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth'
import { companionById, companionLook, companionSpeech } from '../companion'
import { todayFragments, uniqueColors, uniqueKinds, useJournal } from '../journal'
import { GROWTH, PET_LIMIT, XP, useBaekkobi } from '../raise'
import { useDaySteps } from '../steps'
import { CompanionSprite } from '../components/CompanionSprite'
import { GrowthBar, LevelUpModal } from '../components/GrowthPanel'
import { RankBoard } from '../components/RankBoard'
import { useRanking } from '../rank'

export function FilmPage() {
  const { citizen } = useAuth()
  const { fragments } = useJournal()
  const { steps, totalSteps, walking, walkSteps, paused, source, error, startWalk, stopWalk, addSteps } = useDaySteps()
  const { growth, fed, snacks, petted, feed, pet, visitCount, visitedToday, levelUp, ackLevelUp } = useBaekkobi(totalSteps)
  const ranking = useRanking(growth.xp, growth.level)
  // 부스 시연용: /yanggu?demo
  const [params] = useSearchParams()
  const demo = params.has('demo')

  const today = todayFragments(fragments)
  const kinds = uniqueKinds(today).map((item) => item.kind)
  const colors = uniqueColors(today.length > 0 ? today : fragments)
  const look = companionLook(steps, kinds, today.length)
  const companion = companionById(citizen?.companion)
  const speech = companionSpeech(companion.name, steps, kinds, colors[0]?.name)
  const hunger = Math.min(100, fed * 18 + (kinds.includes('melon') || kinds.includes('bread') || kinds.includes('food') ? 20 : 0))
  const mood = Math.min(100, 28 + Math.min(40, Math.round(steps / 80)) + petted * 8)

  return (
    <main className="wrap py-8">
      <p className="text-sm font-bold text-sub">배꼬비 키우기</p>
      <h1 className="font-display mt-1 text-3xl font-extrabold">오늘도 배꼬비와 함께</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
        걸은 만큼, 부스 QR을 찍은 만큼 배꼬비가 자랍니다. 한 걸음이 경험치 {XP.step}, 부스 한 곳이 {XP.visit}이고, 부스에서 받은 먹이를 주면 {XP.feed}가 더 올라요.
      </p>

      <section className="mt-6 rounded-3xl border border-main-100 bg-main-50 px-5 py-6">
        <div className="flex flex-col items-center text-center">
          <CompanionSprite look={look} level={growth.level} className="h-44 w-44" />
          <p className="font-display mt-3 text-lg font-extrabold">
            Lv.{growth.level} {growth.name}
          </p>
          <p className="mt-2 text-sm font-semibold text-main">{speech}</p>
        </div>

        <div className="mt-6">
          <GrowthBar growth={growth} />
        </div>
        <ul className="mt-3 space-y-3">
          <StatBar label="배부름" value={hunger} />
          <StatBar label="기분" value={mood} />
        </ul>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat label="오늘 걸음" value={steps.toLocaleString('ko-KR')} />
          <Stat label="누적 걸음" value={totalSteps.toLocaleString('ko-KR')} />
          <Stat label="오늘 부스" value={`${visitedToday.length}곳`} />
        </div>
        {walking ? (
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-center">
            <p className="text-sm font-extrabold text-main">
              이번 산책 {walkSteps.toLocaleString('ko-KR')}걸음
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {source === 'gps'
                ? '이 기기는 움직임 센서가 없어서 위치로 세고 있어요.'
                : '휴대폰을 손에 들거나 주머니에 넣고 걸어 주세요. 몇 걸음 걸으면 세기 시작해요.'}
            </p>
            {paused ? (
              <p className="mt-1 text-xs font-bold text-point">
                화면이 꺼지거나 다른 앱에 있던 동안은 세지 못했어요.
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">산책 중에는 이 사이트를 켜 둬야 걸음이 세져요.</p>
            )}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => (walking ? stopWalk() : void startWalk())}
            className="rounded-2xl bg-main px-2 py-3 text-sm font-bold text-white"
          >
            {walking ? '산책 끝' : '산책하기'}
          </button>
          <button
            type="button"
            onClick={feed}
            disabled={snacks <= 0}
            className="rounded-2xl border border-main px-2 py-3 text-sm font-bold text-main disabled:opacity-40"
          >
            먹이주기 {snacks}
          </button>
          <button
            type="button"
            onClick={pet}
            disabled={petted >= PET_LIMIT}
            className="rounded-2xl border border-main px-2 py-3 text-sm font-bold text-main disabled:opacity-40"
          >
            쓰다듬기
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          {snacks > 0 ? `먹이 ${snacks}개가 남았어요.` : '부스 QR을 찍으면 먹이가 1개 생겨요.'} 쓰다듬기는 하루 {PET_LIMIT}번, 기분만 올라가요.
        </p>
        {error ? <p className="mt-3 text-center text-xs text-gray-500">{error}</p> : null}
        {demo ? (
          <button
            type="button"
            onClick={() => addSteps(500)}
            className="mt-3 w-full rounded-2xl border border-dashed border-main-200 py-2 text-xs font-bold text-sub"
          >
            시연용 +500걸음
          </button>
        ) : null}
      </section>

      <section className="mt-6">
        <p className="text-sm font-bold">배꼬비 성장 단계</p>
        <ol className="mt-3 grid grid-cols-5 gap-2">
          {GROWTH.map((item) => {
            const reached = growth.level >= item.level
            return (
              <li
                key={item.level}
                className={`rounded-2xl border px-1 py-2 text-center ${reached ? 'border-main-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
              >
                <CompanionSprite
                  level={item.level}
                  className={`mx-auto h-12 w-12 ${reached ? '' : 'opacity-30 grayscale'}`}
                />
                <p className="mt-1 text-[11px] font-extrabold">Lv.{item.level}</p>
                <p className="text-[10px] text-gray-500">{item.need.toLocaleString('ko-KR')}</p>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 text-xs text-gray-500">지금까지 부스 QR {visitCount}번 · 플리마켓 부스 QR을 찍으면 경험치가 올라요.</p>
      </section>

      <RankBoard
        id={ranking.id}
        joined={ranking.joined}
        top={ranking.top}
        me={ranking.me}
        error={ranking.error}
        myName={ranking.name}
        myLevel={growth.level}
      />

      {levelUp ? <LevelUpModal growth={levelUp} onClose={ackLevelUp} /> : null}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-2 py-3">
      <p className="text-[11px] font-bold text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold">{value}</p>
    </div>
  )
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <li>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-main" style={{ width: `${Math.max(6, value)}%` }} />
      </div>
    </li>
  )
}
