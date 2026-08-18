import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EXPAND, EXPAND_PHASE, HANDOFF_AT } from '../config/expandTransition'

/**
 * Index of the last block the expanded column is actually going to paint.
 *
 * The compact column gets cut to the same set for the duration of the morph, so
 * both columns carry identical content when they swap at the handoff. Without
 * it, every block the user scrolled past is still mounted at opacity 1 and
 * paints the moment the box stops clipping — then disappears at the handoff,
 * because the expanded column never had it.
 *
 * The predicate below MUST stay identical to the one in BlockRenderer that
 * demotes an 'instant' block back to 'scroll'. That is the whole mechanism: the
 * same rule applied to both columns is what keeps them in agreement.
 *
 * Returns null when nothing can be measured. Every failure path here degrades
 * to "no cut", never to "hide everything".
 */
export function measureVisibleCut(expandedRoot) {
  const nodes = expandedRoot?.querySelectorAll('[data-block-index]')
  if (!nodes?.length) return null

  const viewportBottom = window.innerHeight
  let cut = null

  for (const node of nodes) {
    if (node.getBoundingClientRect().top >= viewportBottom) break
    cut = Number(node.dataset.blockIndex)
  }

  return Number.isFinite(cut) ? Math.max(cut, 0) : null
}

/**
 * Where the container's clip has to land: past every viewport edge, expressed
 * as insets on the container's own border box. Negative insets grow the clip
 * outward.
 *
 * Measured while the container is at rest. It is position:fixed with inline
 * width/height that do not change during the morph, so these stay valid for the
 * whole grow — which is exactly why the clip lives on the container and not on
 * the morph layer, which is simultaneously translating and resizing.
 */
function measureClipTarget(container) {
  const rect = container?.getBoundingClientRect()
  if (!rect) return null

  const m = EXPAND.clipMargin

  return {
    top: -(rect.top + m),
    right: -(window.innerWidth - rect.right + m),
    bottom: -(window.innerHeight - rect.bottom + m),
    left: -(rect.left + m),
  }
}

/**
 * Manages the expand animation state and FLIP measurement.
 *
 * The `blocked` prop prevents expand from starting while navMorph is active.
 * Additionally, we track the scroll position at expand-start to offset the
 * compact content's initial Y position (it's visually scrolled down inside
 * its container, but getBoundingClientRect reports the container's top edge).
 */
export function useExpandMorph({ scrollContainerRef, containerRef, blocked }) {
  const [phase, setPhase] = useState(EXPAND_PHASE.IDLE)
  const [morph, setMorph] = useState(null)
  const [cutIndex, setCutIndex] = useState(null)
  const [clipTo, setClipTo] = useState(null)
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

    // The expanded layer is mounted at its final geometry by now, so this is
    // the first moment it can be asked what it is going to paint. Lands one
    // commit after GROW, same as `morph` — React flushes layout-effect state
    // before paint, so no frame is painted uncut, and the clip has not opened
    // past the box's own edges in that time either.
    setCutIndex(measureVisibleCut(expandedRef.current))
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

    // Batched with setPhase, so the clip's destination is available on the very
    // first GROW render. It opens from the box's own edges, so the frame that
    // stops using overflow:hidden is still clipped to exactly the same rect.
    setClipTo(measureClipTarget(containerRef?.current))

    setMorph(null) // Clear previous measurement
    setCutIndex(null)
    setPhase(EXPAND_PHASE.GROW)
  }, [blocked, phase, scrollContainerRef, containerRef])

  return {
    phase,
    morph,
    cutIndex,
    clipTo,
    morphRef,
    expandedRef,
    isAnimating,
    showExpanded,
    showCompact,
    beginExpand,
  }
}
