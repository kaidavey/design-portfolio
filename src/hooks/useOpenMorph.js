import { useLayoutEffect, useState } from 'react'
import { OPEN_PHASE, buildOpenMorphTimeline } from '../config/openMorphTimeline'
import { readOpenMorph } from '../lib/openMorphBaton'

// Motion's `reducedMotion="user"` only stands down transform and layout
// animations; this morph travels on top/left/width/height, which it would
// happily keep animating. Same reason useNavMorph asks directly.
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * Drives the open morph: a proxy card flying from the home cover's rect to the
 * compact container's, with the real container concealed until it arrives.
 *
 * The origin is read during render, not in an effect. The container has to be
 * concealed on the very first commit — an effect runs one frame too late, and
 * that frame paints the destination at full size before the proxy has left.
 *
 * Every failure path lands on DONE, which is the resting state. There is no
 * way to get stuck concealed.
 */
export function useOpenMorph({ slug, containerRef, config }) {
  const [origin] = useState(() => (prefersReducedMotion() ? null : readOpenMorph(slug)))
  const [phase, setPhase] = useState(origin ? OPEN_PHASE.FLIGHT : OPEN_PHASE.DONE)
  const [dest, setDest] = useState(null)

  // Mount-only: the morph belongs to this mount and to the slug it arrived
  // with. A later slug change is a nav morph's business, not this one's.
  useLayoutEffect(() => {
    if (!origin) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect?.width) {
      setPhase(OPEN_PHASE.DONE)
      return
    }

    setDest({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })

    const timeline = buildOpenMorphTimeline(config.openMorph)
    const revealTimer = setTimeout(() => setPhase(OPEN_PHASE.REVEAL), timeline.revealAtMs)
    const doneTimer = setTimeout(() => setPhase(OPEN_PHASE.DONE), timeline.totalMs)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    origin,
    dest,
    // Nothing at the destination may paint while the proxy is still in the
    // air: a container already sitting there reads as a second card.
    concealed: phase === OPEN_PHASE.FLIGHT,
    // `dest` lands one commit after mount, before paint, so no frame is ever
    // painted with the page concealed and no proxy over it.
    active: Boolean(origin && dest) && phase !== OPEN_PHASE.DONE,
  }
}
