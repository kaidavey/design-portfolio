import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EXPAND, EXPAND_PHASE, EXPAND_TOTAL_MS, HANDOFF_AT } from '../config/expandTransition'

/**
 * Manages the expand animation state and FLIP measurement.
 *
 * The `blocked` prop prevents expand from starting while navMorph is active.
 * Additionally, we track the scroll position at expand-start to offset the
 * compact content's initial Y position (it's visually scrolled down inside
 * its container, but getBoundingClientRect reports the container's top edge).
 */
export function useExpandMorph({ scrollContainerRef, blocked }) {
  const [phase, setPhase] = useState(EXPAND_PHASE.IDLE)
  const [morph, setMorph] = useState(null)
  const morphRef = useRef(null)
  const expandedRef = useRef(null)
  const phaseTimerRef = useRef(null)
  const scrollAtExpandRef = useRef(0)

  const isAnimating = phase !== EXPAND_PHASE.IDLE && phase !== EXPAND_PHASE.DONE
  // Both layers must be mounted during animation so compact can morph and expanded can be measured
  const showExpanded = phase !== EXPAND_PHASE.IDLE
  const showCompact = phase === EXPAND_PHASE.IDLE || isAnimating

  useEffect(
    () => () => {
      clearTimeout(phaseTimerRef.current)
    },
    []
  )

  // FLIP measurement: runs once when phase becomes GROW
  useLayoutEffect(() => {
    if (phase !== EXPAND_PHASE.GROW) return

    const c = morphRef.current?.getBoundingClientRect()
    const x = expandedRef.current?.getBoundingClientRect()
    if (!c || !x || !c.width || !x.width) return

    // FIX: Capture the scroll offset at expand-start. The compact content is
    // visually displaced down by this amount inside its scrollable container,
    // but getBoundingClientRect reports the container's top edge. We subtract
    // scrollAtExpandRef from dy to place the expanded column at the scrolled
    // position, not the container top.
    const scrollOffset = scrollAtExpandRef.current

    setMorph({
      fromWidth: c.width,
      toWidth: x.width,
      dx: x.left - c.left,
      // Offset fromY by the scroll amount so the blocks travel from their
      // visible position, not from the container's geometric top.
      fromY: -scrollOffset,
      toY: x.top - c.top,
    })
  }, [phase])

  // Phase sequencing
  useEffect(() => {
    if (phase === EXPAND_PHASE.GROW) {
      phaseTimerRef.current = setTimeout(() => {
        setPhase(EXPAND_PHASE.HANDOFF)
      }, HANDOFF_AT * 1000)
    } else if (phase === EXPAND_PHASE.HANDOFF) {
      phaseTimerRef.current = setTimeout(() => {
        setPhase(EXPAND_PHASE.DONE)
      }, EXPAND.handoffDuration * 1000)
    }
  }, [phase])

  const beginExpand = useCallback(() => {
    // Guard: Don't start if blocked (navMorph active) or already animating/expanded
    if (blocked || phase !== EXPAND_PHASE.IDLE) return

    // Capture scroll position before any state changes
    scrollAtExpandRef.current = scrollContainerRef.current?.scrollTop ?? 0

    setMorph(null) // Clear previous measurement
    setPhase(EXPAND_PHASE.GROW)
  }, [blocked, phase, scrollContainerRef])

  return {
    phase,
    morph,
    morphRef,
    expandedRef,
    isAnimating,
    showExpanded,
    showCompact,
    beginExpand,
  }
}
