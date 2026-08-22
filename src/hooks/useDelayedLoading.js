import { useEffect, useRef, useState } from 'react'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

/**
 * Gate a loading flag behind two timers so the skeleton never flickers.
 *
 * `delayInMs` swallows the fast cache hits — a skeleton that appears and
 * vanishes inside 200ms reads as a glitch. `minVisibleMs` holds it once it does
 * appear, so a response landing a frame later does not blink it back out.
 */
export function useDelayedLoading(isLoading) {
  const { delayInMs, minVisibleMs } = CASE_STUDY_LAYOUT.skeleton
  const [visible, setVisible] = useState(false)
  const shownAtRef = useRef(0)

  useEffect(() => {
    let timer

    if (isLoading && !visible) {
      timer = setTimeout(() => {
        shownAtRef.current = performance.now()
        setVisible(true)
      }, delayInMs)
    } else if (!isLoading && visible) {
      const elapsed = performance.now() - shownAtRef.current
      const holdTime = Math.max(0, minVisibleMs - elapsed)
      timer = setTimeout(() => setVisible(false), holdTime)
    }

    return () => clearTimeout(timer)
  }, [isLoading, visible, delayInMs, minVisibleMs])

  return visible
}
