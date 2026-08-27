import { useCallback, useEffect, useState } from 'react'
import { YANGGU_CENTER } from './data/picks'
import { getCurrentPosition } from './geo'
import type { GeoPoint } from './types'

export function useOrigin() {
  const [origin, setOrigin] = useState<GeoPoint>(YANGGU_CENTER)
  const [located, setLocated] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  const locate = useCallback(async () => {
    setLocating(true)
    setError('')
    try {
      const point = await getCurrentPosition()
      setOrigin(point)
      setLocated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '위치를 가져오지 못했습니다.')
      setOrigin(YANGGU_CENTER)
      setLocated(false)
    } finally {
      setLocating(false)
    }
  }, [])

  useEffect(() => {
    void locate()
  }, [locate])

  return { origin, located, locating, error, locate }
}
