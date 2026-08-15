import { useCallback, useEffect, useRef, useState } from 'react'
import { NAV_PHASE, buildNavMorphTimeline } from '../config/navMorphTimeline'

// Owns the side-to-side navigation morph. Measures peek card and container
// rects before navigation, freezes them in state, and drives the proxy overlay.
//
// Also owns the reveal moment. Content beneath a proxy is swapped at
// `phase === REVEAL`, never on a delay of its own — an opaque proxy is
// covering that rect, so the swap is invisible regardless of frame timing.
export function useNavMorph({
  containerRef,
  prevPeekCardRef,
  nextPeekCardRef,
  currentStudy,
  prevStudy,
  nextStudy,
  config,
}) {
  const [navMorph, setNavMorph] = useState(null)
  const [navPhase, setNavPhase] = useState(null)
  const [blocksSuppressed, setBlocksSuppressed] = useState(false)
  const revealTimerRef = useRef(null)
  const endTimerRef = useRef(null)

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(
    () => () => {
      clearTimeout(revealTimerRef.current)
      clearTimeout(endTimerRef.current)
    },
    []
  )

  function rectOf(ref) {
    const r = ref.current?.getBoundingClientRect()
    if (!r || !r.width) return null
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }

  // Measure everything the morph needs BEFORE navigate(). By the time React
  // re-renders for the new slug, the pre-navigation geometry is already frozen
  // in state — no measuring across a route change.
  //
  // Returns false when measurement isn't possible (first paint, reduced
  // motion), in which case navigation falls back to the plain slide.
  const beginNavMorph = useCallback(
    (dir) => {
      if (prefersReducedMotion) return false

      const container = rectOf(containerRef)
      const growFrom = rectOf(dir > 0 ? nextPeekCardRef : prevPeekCardRef)
      const shrinkTo = rectOf(dir > 0 ? prevPeekCardRef : nextPeekCardRef)
      const enteringStudy = dir > 0 ? nextStudy : prevStudy

      if (!container || !growFrom || !shrinkTo || !enteringStudy || !currentStudy) {
        return false
      }

      clearTimeout(revealTimerRef.current)
      clearTimeout(endTimerRef.current)

      const t = buildNavMorphTimeline(config.navMorph)

      setBlocksSuppressed(true)
      setNavPhase(NAV_PHASE.FLIGHT)
      setNavMorph({
        dir,
        container,
        growFrom,
        shrinkTo,
        enteringStudy,
        leavingStudy: currentStudy,
      })

      revealTimerRef.current = setTimeout(
        () => setNavPhase(NAV_PHASE.REVEAL),
        t.revealAtMs
      )

      // Blocks stay suppressed for the whole morph: they are already on screen
      // by the reveal, so a late unsuppress would animate visible content in.
      endTimerRef.current = setTimeout(() => {
        setNavMorph(null)
        setNavPhase(null)
        setBlocksSuppressed(false)
      }, t.totalMs)

      return true
    },
    [
      prefersReducedMotion,
      containerRef,
      prevPeekCardRef,
      nextPeekCardRef,
      currentStudy,
      prevStudy,
      nextStudy,
      config,
    ]
  )

  return { navMorph, navPhase, blocksSuppressed, beginNavMorph }
}