import { Icon } from './Icon'

export const OFFICIAL_ISSUE_URL = 'https://yanggudmo.co.kr/dmo'

// 할인 혜택은 양구DMO 공식 사이버 군민증으로 받으므로, 가입·로그인 화면에서 먼저 그쪽 발급을 권한다.
export function OfficialSignup() {
  return (
    <a
      href={OFFICIAL_ISSUE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-main-50 px-4 py-4"
    >
      <span>
        <span className="block text-sm font-extrabold text-main">아직 양구사랑 사이버 군민증이 없나요?</span>
        <span className="mt-1 block text-xs leading-5 text-gray-600">
          양구 할인 혜택은 양구DMO 공식 군민증으로 받아요. 먼저 1분 만에 발급받고, 같은 이메일로 여기 가입해 주세요.
        </span>
        <span className="mt-2 inline-block rounded-full bg-main px-3 py-1.5 text-xs font-bold text-white">
          공식 군민증 발급하러 가기
        </span>
      </span>
      <Icon name="right" className="h-4 w-4 shrink-0 text-main" />
    </a>
  )
}
