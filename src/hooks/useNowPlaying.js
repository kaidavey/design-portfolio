import { useEffect, useRef, useState } from 'react'

const POLL_MS = 30000

/**
 * Polls /api/now-playing and returns the current track.
 *
 * Polling pauses while the tab is hidden and fires immediately on return,
 * so a backgrounded tab isn't burning requests against Spotify's rate limit.
 */
export default function useNowPlaying(pollMs = POLL_MS) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function fetchOnce() {
      try {
        const res = await fetch('/api/now-playing')
        if (!res.ok) throw new Error(res.status)
        const json = await res.json()
        if (cancelled) return
        // The endpoint returns 200 with { error: true } on upstream failure.
        if (json.error) {
          setStatus('error')
        } else {
          setData(json)
          setStatus('ready')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    function schedule() {
      clearTimeout(timerRef.current)
      if (document.visibilityState !== 'visible') return
      timerRef.current = setTimeout(async () => {
        await fetchOnce()
        schedule()
      }, pollMs)
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        fetchOnce()
        schedule()
      } else {
        clearTimeout(timerRef.current)
      }
    }

    fetchOnce()
    schedule()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [pollMs])

  return { ...data, status }
}