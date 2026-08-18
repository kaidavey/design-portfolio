import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import { EXPAND, EXPAND_PHASE } from '../config/expandTransition'
import { NAV_PHASE } from '../config/navMorphTimeline'
import { useExpandMorph } from '../hooks/useExpandMorph.js'
import { useNavMorph } from '../hooks/useNavMorph'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'
import ProgressiveBlur from '../components/core/ProgressiveBlur'
import CaseStudyPeek from '../components/CaseStudyPeek'
import NavMorphOverlay from '../components/caseStudy/NavMorphOverlay'
import { ExpandMorphLayer, ExpandedLayer } from '../components/caseStudy/ExpandLayers'
import { BlockEntranceProvider } from '../context/BlockEntranceContext'
import Tooltip from '../components/core/Tooltip'
import { MorphCutProvider } from '../context/MorphCutContext'
import { ScrollContainerProvider } from '../context/ScrollContainerContext'

const COMPACT = CASE_STUDY_LAYOUT.compact
const EXPANDED = CASE_STUDY_LAYOUT.expanded

// ---------------------------------------------------------------------------
// COMPARTMENTS
//
//   useNavMorph      + NavMorphOverlay   side-to-side shuffle
//   useExpandMorph   + ExpandLayers      compact -> expanded
//
// The two never share a DOM node. Compact content is nested three layers deep,
// and each layer owns exactly one thing:
//
//   ExpandMorphLayer          width / x / y / opacity   (expand only)
//     AnimatePresence
//       motion.div key={slug} variants                  (shuffle only)
//         CaseStudyBody
//
// Merging any two of these reintroduces the transform-ownership conflict that
// broke the expand morph.
// ---------------------------------------------------------------------------

function CaseStudyNavigation({ title }) {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Breadcrumb">
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-nav hover:[color:var(--color-text-secondary)] transition-colors"
      >
        Home
      </Link>
      <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-nav">
        /
      </span>
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-nav hover:[color:var(--color-text-secondary)] transition-colors"
      >
        Work
      </Link>
      {title && (
        <>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-nav">
            /
          </span>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-primary)] text-nav font-medium">
            {title}
          </span>
        </>
      )}
    </nav>
  )
}

function ExpandButton({ onToggleExpand }) {
  return (
    <Tooltip label="Expand" offset={12}>
      <button
        onClick={onToggleExpand}
        aria-label="Expand"
        className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
        style={{ transform: 'rotate(90deg)', position: 'relative', overflow: 'visible' }}
      >
        <svg className="w-[17.5px] h-[17.5px] [color:var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>
    </Tooltip>
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { caseStudies } = useCaseStudies()

  const [direction, setDirection] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const scrollContainerRef = useRef(null)
  const containerRef = useRef(null)
  const prevPeekCardRef = useRef(null)
  const nextPeekCardRef = useRef(null)

  const total = caseStudies.length
  const currentIndex = caseStudies.findIndex((cs) => cs.slug.current === slug)
  const isResolved = currentIndex !== -1
  const hasNeighbors = isResolved && total > 1
  const prevIndex = hasNeighbors ? (currentIndex - 1 + total) % total : -1
  const nextIndex = hasNeighbors ? (currentIndex + 1) % total : -1
  const prevStudy = prevIndex >= 0 ? caseStudies[prevIndex] : null
  const nextStudy = nextIndex >= 0 ? caseStudies[nextIndex] : null
  const prevSlug = prevStudy?.slug.current ?? null
  const nextSlug = nextStudy?.slug.current ?? null
  const currentStudy = caseStudies[currentIndex]

  const { navMorph, navPhase, blocksSuppressed, beginNavMorph } = useNavMorph({
    containerRef,
    prevPeekCardRef,
    nextPeekCardRef,
    currentStudy,
    prevStudy,
    nextStudy,
    config: COMPACT,
  })

  const expand = useExpandMorph({
    scrollContainerRef,
    containerRef,
    blocked: Boolean(navMorph),
  })

  const {
    phase,
    morph,
    cutIndex,
    clipTo,
    morphRef,
    expandedRef,
    isAnimating,
    showExpanded,
    showCompact,
  } = expand

  useNeighborPrefetch(prevSlug, nextSlug)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
      setIsScrolled(false)
    }
  }, [slug])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    function handleScroll() {
      setIsScrolled(scrollContainer.scrollTop > 0)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowLeft' && hasNeighbors) {
        navigateToPrev()
      } else if (e.key === 'ArrowRight' && hasNeighbors) {
        navigateToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // navMorph and isAnimating are read by the navigate guards — omitting them
    // leaves stale closures that ignore an in-flight morph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNeighbors, prevSlug, nextSlug, navMorph, isAnimating])

  function navigateToPrev(opts = {}) {
    if (!prevSlug || isAnimating || navMorph) return
    const { useMorph = true } = opts
    if (useMorph && showCompact) beginNavMorph(-1)
    setDirection(-1)
    navigate(`/work/${prevSlug}`, { replace: true })
  }

  function navigateToNext(opts = {}) {
    if (!nextSlug || isAnimating || navMorph) return
    const { useMorph = true } = opts
    if (useMorph && showCompact) beginNavMorph(1)
    setDirection(1)
    navigate(`/work/${nextSlug}`, { replace: true })
  }

  // ---- SHUFFLE LAYER ------------------------------------------------------

  // Peek slot offset for entry animation: just the reveal width since peeks
  // are at screen edges.
  const slotOffset = 100 // matches peek revealWidth

  // `custom` is an object (not the bare direction) because exiting children
  // only receive updates through AnimatePresence's `custom` prop — the
  // morphing flag must reach them that way, or exits use the previous
  // render's variants and slide when they should fade.
  const morphCustom = { dir: direction, morphing: Boolean(navMorph) }

  // Both content swaps happen while an opaque proxy covers the container rect,
  // so they are hard cuts. No delay arithmetic, nothing to keep in sync.
  const variants = {
    enter: (c) =>
      c.morphing
        ? { x: 0, opacity: 0 }
        : { x: c.dir > 0 ? slotOffset : -slotOffset, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: (c) =>
      c.morphing
        ? { x: 0, opacity: 0, transition: { duration: 0 } }
        : { x: c.dir > 0 ? -slotOffset : slotOffset, opacity: 0 },
  }

  const springTransition = {
    type: 'spring',
    stiffness: 320,
    damping: 34,
  }

  // During a morph, `animate` is driven off the hook's phase rather than a
  // variant label — the reveal has exactly one owner.
  const shuffleAnimate = navMorph
    ? { x: 0, opacity: navPhase === NAV_PHASE.REVEAL ? 1 : 0 }
    : 'center'

  const shuffleTransition = navMorph ? { duration: 0 } : springTransition

  // ---- SKIN (no block descendants, so it may freely fade and scale) --------

  // Container chrome is hidden for the flight: during it the proxies ARE the
  // container, and a second empty frame behind them reads as a third card.
  // Both cuts are covered by an opaque proxy — the shrink proxy departs from
  // the container rect at t=0, and the grow proxy has arrived on it by the
  // reveal — so neither is ever visible.
  const chromeHidden = Boolean(navMorph) && navPhase !== NAV_PHASE.REVEAL

  const skinAnimate = isAnimating
    ? { scale: EXPAND.skinExitScale, opacity: 0 }
    : { scale: 1, opacity: chromeHidden ? 0 : 1 }

  const skinTransition = isAnimating
    ? {
        scale: { duration: EXPAND.skinExitDuration, ease: EXPAND.ease },
        opacity: { duration: EXPAND.skinExitDuration, ease: EXPAND.ease },
      }
    : { duration: 0 }

  // ---- CONTAINER CLIP -----------------------------------------------------

  // The block column has to escape the box during the grow, but only as fast as
  // the box opens. Dropping overflow:hidden in a single frame reveals whatever
  // sits below the fold instantly; this opens the window on the geometry's own
  // curve and, by the time the column arrives, is clear of the viewport.
  //
  // It lives on the container because the container is the only stationary
  // thing here: position:fixed with inline width/height, so inset values stay
  // meaningful for the whole animation. The morph layer is resizing.
  const clipClosed = `inset(0px 0px 0px 0px round ${COMPACT.containerBorderRadius})`
  const clipOpen = clipTo
    ? `inset(${clipTo.top}px ${clipTo.right}px ${clipTo.bottom}px ${clipTo.left}px round 0px)`
    : null
  const clipping = isAnimating && Boolean(clipOpen)

  // Two keyframes rather than one: the array pins the start at the box's own
  // edges, so the frame that stops using overflow:hidden is clipped to exactly
  // the rect overflow:hidden was clipping to.
  const clipAnimate = clipping ? { clipPath: [clipClosed, clipOpen] } : { clipPath: 'none' }
  const clipTransition = clipping
    ? { duration: EXPAND.growDuration, ease: EXPAND.ease }
    : { duration: 0 }

  return (
    <Shell
      header={
        <div style={{ visibility: 'hidden' }}>
          <CaseStudyNavigation title={currentStudy?.title} />
        </div>
      }
      isExpanded={showExpanded}
      preventScroll={!showExpanded}
    >
      <div
        className="relative w-full pt-[16px]"
        style={{
          minHeight: showExpanded ? 'auto' : '100vh',
          paddingBottom: showExpanded ? '15vh' : undefined,
        }}
      >
        {showExpanded && (
          <>
            <ExpandedLayer
              phase={phase}
              layerRef={expandedRef}
              style={{
                width: EXPANDED.contentWidth,
                maxWidth: EXPANDED.contentMaxWidth || 'none',
                marginLeft: 'auto',
                marginRight: 'auto',
                // Must be above compact container (zIndex: 5) during handoff so content is visible
                position: 'relative',
                zIndex: isAnimating ? 8 : 'auto',
              }}
            >
              <BlockEntranceProvider suppress={false}>
                <AnimatePresence initial={false} custom={morphCustom} mode="wait">
                  <motion.div
                    key={slug}
                    custom={morphCustom}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={springTransition}
                  >
                    {/* `instant` puts these blocks at their final state from
                        frame one. Their 0.5s blur entrance would otherwise still
                        be running at the handoff (it lands at 0.75s, the swap is
                        at 0.7s), so the columns would not match when they trade
                        places — and it plays behind an opacity-0 layer anyway. */}
                    <CaseStudyBody slug={slug} instant={isAnimating} />
                  </motion.div>
                </AnimatePresence>
              </BlockEntranceProvider>
            </ExpandedLayer>

            {/* Held back until the handoff. During the grow this sits at
                z-index 10, above the travelling compact column, and its blur
                strip is visible across the top of the screen. */}
            {phase !== EXPAND_PHASE.GROW && (
              <div
                className="fixed pointer-events-none left-0 right-0"
                style={{ top: 0, zIndex: 10 }}
              >
                <ProgressiveBlur />
              </div>
            )}
          </>
        )}

        {showCompact && (
          <>
            <div
              className="fixed flex items-start justify-between"
              style={{
                left: 0,
                right: 0,
                top: COMPACT.containerVerticalOffset,
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <CaseStudyPeek
                ref={prevPeekCardRef}
                side="prev"
                study={prevStudy}
                config={COMPACT}
                isAnimating={isAnimating}
                navMorph={navMorph}
                onClick={() => navigateToPrev()}
              />

              <motion.div
                ref={containerRef}
                className="relative"
                style={{
                  width: COMPACT.containerWidth,
                  maxWidth: COMPACT.containerMaxWidth,
                  height: COMPACT.containerHeight,
                  maxHeight: COMPACT.containerMaxHeight,
                  borderRadius: COMPACT.containerBorderRadius,
                  // Un-clip during the grow: the block column expands past the
                  // container's edges while the skin fades out beneath it. The
                  // animated clip-path takes over the containment from here —
                  // see clipAnimate above.
                  overflow: isAnimating ? 'visible' : 'hidden',
                  pointerEvents: isAnimating ? 'none' : 'auto',
                }}
                initial={false}
                animate={clipAnimate}
                transition={clipTransition}
              >
                {/* Skin: all of the container's paint lives here, behind the
                    blocks, so it can fade without taking the blocks with it. */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: COMPACT.containerBorderRadius,
                    borderWidth: COMPACT.containerBorderWidth,
                    borderStyle: 'solid',
                    borderColor: isScrolled ? 'transparent' : COMPACT.containerBorderColor,
                    background: COMPACT.containerBackgroundColor,
                    backdropFilter: `blur(${COMPACT.containerBackdropBlur})`,
                    boxShadow: COMPACT.containerBoxShadow,
                    transformOrigin: 'top center',
                  }}
                  animate={skinAnimate}
                  transition={skinTransition}
                />

                <div
                  ref={scrollContainerRef}
                  className="relative flex flex-col case-study-scroll h-full w-full"
                  style={{
                    paddingTop: COMPACT.contentPaddingTop,
                    paddingRight: COMPACT.contentPaddingRight,
                    paddingBottom: COMPACT.contentPaddingBottom,
                    paddingLeft: COMPACT.contentPaddingLeft,
                    gap: COMPACT.contentGap,
                    overflowY: isAnimating ? 'visible' : 'auto',
                    overflowX: isAnimating ? 'visible' : 'hidden',
                  }}
                >
                  {/* Compact blocks scroll inside the box, not the viewport, and
                      during a morph they are cut to what the expanded column will
                      paint. Both are compact-only: the expanded tree gets neither
                      provider, so it keeps the viewport and stays uncut. */}
                  <ScrollContainerProvider rootRef={scrollContainerRef}>
                    <MorphCutProvider cutIndex={cutIndex}>
                      <ExpandMorphLayer phase={phase} morph={morph} layerRef={morphRef}>
                        <AnimatePresence initial={false} custom={morphCustom} mode="wait">
                          <motion.div
                            key={slug}
                            custom={morphCustom}
                            variants={variants}
                            initial="enter"
                            animate={shuffleAnimate}
                            exit="exit"
                            transition={shuffleTransition}
                          >
                            <BlockEntranceProvider suppress={blocksSuppressed}>
                              <CaseStudyBody
                                slug={slug}
                                expandButton={<ExpandButton onToggleExpand={expand.beginExpand} />}
                              />
                            </BlockEntranceProvider>
                          </motion.div>
                        </AnimatePresence>
                      </ExpandMorphLayer>
                    </MorphCutProvider>
                  </ScrollContainerProvider>
                </div>
              </motion.div>

              <CaseStudyPeek
                ref={nextPeekCardRef}
                side="next"
                study={nextStudy}
                config={COMPACT}
                isAnimating={isAnimating}
                navMorph={navMorph}
                onClick={() => navigateToNext()}
              />
            </div>

            {navMorph && <NavMorphOverlay navMorph={navMorph} config={COMPACT} />}

            {isScrolled && (
              <motion.div
                className="fixed pointer-events-none"
                style={{
                  left: '50%',
                  top: COMPACT.containerVerticalOffset,
                  width: COMPACT.containerWidth,
                  maxWidth: COMPACT.containerMaxWidth,
                  height: COMPACT.containerHeight,
                  maxHeight: COMPACT.containerMaxHeight,
                  borderRadius: COMPACT.containerBorderRadius,
                  zIndex: 6,
                  x: '-50%',
                  transformOrigin: 'top center',
                }}
                animate={skinAnimate}
                transition={skinTransition}
              >
                <ProgressiveBlur />
              </motion.div>
            )}

            {isScrolled && (
              <motion.div
                className="fixed pointer-events-none"
                style={{
                  left: '50%',
                  top: COMPACT.containerVerticalOffset,
                  width: COMPACT.containerWidth,
                  maxWidth: COMPACT.containerMaxWidth,
                  height: COMPACT.containerHeight,
                  maxHeight: COMPACT.containerMaxHeight,
                  borderRadius: COMPACT.containerBorderRadius,
                  zIndex: 7,
                  borderWidth: COMPACT.containerBorderWidth,
                  borderStyle: 'solid',
                  borderColor: COMPACT.containerBorderColor,
                  x: '-50%',
                  transformOrigin: 'top center',
                }}
                animate={skinAnimate}
                transition={skinTransition}
              />
            )}
          </>
        )}
      </div>
    </Shell>
  )
}