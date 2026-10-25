import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { rankerId } from './rank'

const SOURCE_KEY = 'yanggu-visit-source'

// 어디서 들어왔는지: 링크에 ?from=insta 나 ?utm_source=insta 를 붙이면 그 이름으로 남는다.
// 같은 탭 안에서는 처음 들어온 경로를 계속 쓴다.
function visitSource(search: string) {
  const params = new URLSearchParams(search)
  const fromLink = params.get('from') ?? params.get('utm_source') ?? params.get('src')
  try {
    if (fromLink) sessionStorage.setItem(SOURCE_KEY, fromLink)
    return sessionStorage.getItem(SOURCE_KEY) ?? ''
  } catch {
    return fromLink ?? ''
  }
}

function send(body: object) {
  const data = JSON.stringify(body)
  try {
    if (navigator.sendBeacon?.('/api/visit', new Blob([data], { type: 'application/json' }))) return
  } catch {
    // sendBeacon이 막힌 브라우저는 fetch로 보낸다.
  }
  void fetch('/api/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    keepalive: true,
  }).catch(() => {})
}

// 화면이 바뀔 때마다 방문 기록을 하나 남긴다. 내 컴퓨터에서 개발할 때는 남기지 않는다.
export function useVisitLog() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (['localhost', '127.0.0.1'].includes(location.hostname)) return
    if (pathname === '/stats') return
    const booth = pathname.match(/^\/q\/([^/]+)/)?.[1] ?? ''
    send({ id: rankerId(), path: pathname, source: visitSource(search), booth })
  }, [pathname, search])
}
