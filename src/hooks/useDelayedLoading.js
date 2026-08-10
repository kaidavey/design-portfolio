import { useEffect, useRef, useState } from 'react'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

export function useDelayedLoading(isLoading) {
  const { delayInMs, minVisibleMs } = CASE_STUDY_LAYOUT.skeleton
  const [visible, setVisible] = useState(false)
  const shownAtRef = useRef(0)

  useEffect(() => {
    console.log('[useDelayedLoading]', { isLoading, visible })
    let timer

    if (isLoading && !visible) {
      console.log('[useDelayedLoading] Arming delay-in timer for', delayInMs, 'ms')
      timer = setTimeout(() => {
        console.log('[useDelayedLoading] Delay-in fired, showing skeleton')
        shownAtRef.current = performance.now()
        setVisible(true)
      }, delayInMs)
    } else if (!isLoading && visible) {
      const elapsed = performance.now() - shownAtRef.current
      const holdTime = Math.max(0, minVisibleMs - elapsed)
      console.log('[useDelayedLoading] Arming delay-out timer for', holdTime, 'ms')
      timer = setTimeout(
        () => {
          console.log('[useDelayedLoading] Delay-out fired, hiding skeleton')
          setVisible(false)
        },
        holdTime,
      )
    }

    return () => clearTimeout(timer)
  }, [isLoading, visible, delayInMs, minVisibleMs])

  return visible
}
