import { useLayoutEffect, useState } from 'react'
import { MORPH_PHASE, buildMorphTimeline } from '../config/morphTimeline'

// Motion's `reducedMotion="user"` only stands down transform and layout
// animations; these morphs travel on top/left/width/height, which it would
// happily keep animating. Same reason useNavMorph asks directly.
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * The arriving half of a route morph, in either direction.
 *
 * A page that might have been arrived at by a morph asks this hook two things:
 * `read` for the departure the other page staged, and `measureDest` for where
 * on this page the proxy is going to land. Everything else — the phase clock,
 * concealing the destination, retiring the overlay — is the same both ways.
 *
 * The origin is read during render, not in an effect. The destination has to
 * be concealed on the very first commit; an effect runs one frame too late,
 * and that frame paints it at full size before the proxy has left.
 *
 * Every failure path lands on DONE, which is the resting state. There is no
 * way to get stuck concealed.
 *
 * @param {() => object|null} read - takes the staged departure, or null
 * @param {(origin) => object|null} measureDest - the destination this page offers
 * @param {object} config - one of CASE_STUDY_LAYOUT.compact.{open,close}Morph
 */
export function useMorphArrival({ read, measureDest, config }) {
  const [origin] = useState(() => (prefersReducedMotion() ? null : read()))
  const [phase, setPhase] = useState(origin ? MORPH_PHASE.FLIGHT : MORPH_PHASE.DONE)
  const [dest, setDest] = useState(null)

  // Mount-only: the morph belongs to this mount and to the route it arrived
  // with. Anything that changes later is some other transition's business.
  useLayoutEffect(() => {
    if (!origin) return

    const measured = measureDest(origin)
    if (!measured) {
      setPhase(MORPH_PHASE.DONE)
      return
    }

    setDest(measured)

    const timeline = buildMorphTimeline(config)
    const revealTimer = setTimeout(() => setPhase(MORPH_PHASE.REVEAL), timeline.revealAtMs)
    const doneTimer = setTimeout(() => setPhase(MORPH_PHASE.DONE), timeline.totalMs)

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
    // air: the thing it is flying toward, already sitting there, reads as a
    // second card.
    concealed: phase === MORPH_PHASE.FLIGHT,
    // `dest` lands one commit after mount, before paint, so no frame is ever
    // painted with the destination concealed and no proxy over it.
    active: Boolean(origin && dest) && phase !== MORPH_PHASE.DONE,
  }
}
