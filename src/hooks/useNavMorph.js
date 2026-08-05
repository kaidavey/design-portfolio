import { useCallback, useEffect, useRef, useState } from 'react'

// Owns the side-to-side navigation morph. Measures peek card and container
// rects before navigation, freezes them in state, and drives the proxy overlay.
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
  const [blocksSuppressed, setBlocksSuppressed] = useState(false)
  const navMorphTimerRef = useRef(null)
  const blocksTimerRef = useRef(null)

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ).current

  useEffect(
    () => () => {
      clearTimeout(navMorphTimerRef.current)
      clearTimeout(blocksTimerRef.current)
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
      clearTimeout(navMorphTimerRef.current)
      clearTimeout(blocksTimerRef.current)

      setBlocksSuppressed(true)

      setNavMorph({
        dir,
        container,
        growFrom,
        shrinkTo,
        enteringStudy,
        leavingStudy: currentStudy,
      })

      // Unsuppress blocks once content is mostly visible: contentEnterDelay
      // plus most of contentEnterDuration.
      const blocksDelay = (config.navMorph.contentEnterDelay + 0.2) * 1000
      blocksTimerRef.current = setTimeout(() => setBlocksSuppressed(false), blocksDelay)

      navMorphTimerRef.current = setTimeout(() => {
        setNavMorph(null)
        setBlocksSuppressed(false)
      }, config.navMorph.totalMs)
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

  return { navMorph, blocksSuppressed, beginNavMorph }
}
