import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'
import ProgressiveBlur from '../components/core/ProgressiveBlur'
import { BlockEntranceProvider } from '../context/BlockEntranceContext'

// Expand transition: a three-phase morph.
//   Phase 1 (grow):      compact block column transforms to the exact width
//                        and position of the expanded column, fully opaque
//                        the whole way. The gray SKIN layer (a child behind
//                        the blocks — see below) scales slightly and fades.
//   Phase 2 (hold):      blocks rest at the arrived geometry for a beat so
//                        the arrival is perceptible.
//   Phase 3 (crossfade): opacity-only handoff to the expanded tree.
//
// Structural invariant: the container element itself must NEVER animate
// opacity or scale — the blocks are its children, and parent opacity/scale
// multiplies onto them, killing the morph. All visual exit animation lives
// on the skin layer.
const EXPAND = {
  ease: [0.4, 0, 0.2, 1], // matches easings.easeDefault
  growDuration: 0.6,
  holdDuration: 0.1,
  crossfadeDuration: 0.22,
  skinExitScale: 1.02,
  skinExitDuration: 0.4,
  swapMs: 960, // must cover (grow + hold + crossfade) * 1000
}

function CaseStudyNavigation({ title }) {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Breadcrumb">
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-nav hover:text-[#2F2F2F] transition-colors"
      >
        Home
      </Link>
      <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-nav">
        /
      </span>
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-nav hover:text-[#2F2F2F] transition-colors"
      >
        Work
      </Link>
      {title && (
        <>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-nav">
            /
          </span>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-black text-nav font-medium">
            {title}
          </span>
        </>
      )}
    </nav>
  )
}

function ExpandButton({ onToggleExpand }) {
  return (
    <button
      onClick={onToggleExpand}
      aria-label="Expand"
      className="flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
      style={{ transform: 'rotate(90deg)' }}
    >
      <Maximize2 className="w-[17.5px] h-[17.5px] text-[#3A3A3A]" strokeWidth={2} />
    </button>
  )
}

export default function CaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { caseStudies } = useCaseStudies()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollContainerRef = useRef(null)
  const compactContentRef = useRef(null)
  const expandedRef = useRef(null)
  const expandTimerRef = useRef(null)

  // Measured morph geometry, computed once per expand in a layout effect
  // (pre-paint). Compares the compact BLOCK COLUMN (the content inside the
  // container, which is narrower than the container itself) against the
  // expanded column's final rect:
  //   scale — how much wider the expanded column is (> 1)
  //   dx/dy — translation from the compact column's top-center to the
  //           expanded column's top-center, in viewport px
  const [morph, setMorph] = useState(null)

  // Both trees are mounted during the transition so there is something to
  // cross-fade *to*. Without this the compact view fades to the page
  // background and the expanded view hard-cuts in.
  const showExpanded = isExpanded || isAnimating
  const showCompact = !isExpanded

  const currentIndex = caseStudies.findIndex((cs) => cs.slug.current === slug)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < caseStudies.length - 1
  const prevSlug = hasPrev ? caseStudies[currentIndex - 1].slug.current : null
  const nextSlug = hasNext ? caseStudies[currentIndex + 1].slug.current : null

  const currentStudy = caseStudies[currentIndex]

  useNeighborPrefetch(slug, caseStudies)

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
    return () => clearTimeout(expandTimerRef.current)
  }, [])

  // FLIP measurement. Runs in the same commit that mounts the expanded tree
  // (isAnimating → true), before the browser paints and before any animation
  // has ticked, so both rects are untransformed truth in shared viewport
  // coordinates. The expanded wrapper animates opacity only, so its rect is
  // its exact final geometry.
  useLayoutEffect(() => {
    if (!isAnimating) return
    const c = compactContentRef.current?.getBoundingClientRect()
    const x = expandedRef.current?.getBoundingClientRect()
    if (!c || !x || !c.width || !x.width) return

    setMorph({
      scale: x.width / c.width,
      dx: x.left + x.width / 2 - (c.left + c.width / 2),
      dy: x.top - c.top,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating])

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

      if (e.key === 'ArrowLeft' && hasPrev) {
        navigateToPrev()
      } else if (e.key === 'ArrowRight' && hasNext) {
        navigateToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hasPrev, hasNext, prevSlug, nextSlug])

  function navigateToPrev() {
    if (!prevSlug) return
    setDirection(-1)
    navigate(`/work/${prevSlug}`, { replace: true })
  }

  function navigateToNext() {
    if (!nextSlug) return
    setDirection(1)
    navigate(`/work/${nextSlug}`, { replace: true })
  }

  function handleToggleExpand() {
    if (isAnimating || isExpanded) return
    setMorph(null)
    setIsAnimating(true)
    expandTimerRef.current = setTimeout(() => {
      setIsExpanded(true)
      setIsAnimating(false)
    }, EXPAND.swapMs)
  }

  function handleDragEnd(_e, info) {
    if (isExpanded || isAnimating) return

    const threshold = 80
    const velocity = info.velocity.x

    if (info.offset.x > threshold || velocity > 300) {
      if (hasPrev) {
        navigateToPrev()
      }
    } else if (info.offset.x < -threshold || velocity < -300) {
      if (hasNext) {
        navigateToNext()
      }
    }
  }

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  }

  const transition = {
    type: 'spring',
    stiffness: 320,
    damping: 34,
  }

  // Compact geometry stays pinned to the compact config for the whole
  // transition — the compact tree never travels, it only fades.
  const compactConfig = CASE_STUDY_LAYOUT.compact
  const expandedConfig = CASE_STUDY_LAYOUT.expanded

  // Gray skin layer (and the overlay siblings): slight scale-up and fade,
  // finishing during the grow phase. Applied ONLY to elements with no block
  // descendants.
  const skinAnimate = isAnimating
    ? { scale: EXPAND.skinExitScale, opacity: 0 }
    : { scale: 1, opacity: 1 }
  const skinTransition = {
    scale: { duration: EXPAND.skinExitDuration, ease: EXPAND.ease },
    opacity: { duration: EXPAND.skinExitDuration, ease: EXPAND.ease },
  }

  const crossfadeDelay = EXPAND.growDuration + EXPAND.holdDuration

  // Compact block column: transforms to the measured expanded geometry over
  // the grow phase, holds fully opaque through grow + hold, then fades out.
  const blockMorphAnimate =
    isAnimating && morph
      ? {
          x: morph.dx,
          y: morph.dy,
          scale: morph.scale,
          opacity: 0,
        }
      : null // fall through to the normal slug-swap variants
  const blockMorphTransition = {
    x: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    y: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    scale: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    opacity: {
      delay: crossfadeDelay,
      duration: EXPAND.crossfadeDuration,
      ease: 'linear',
    },
  }

  // Expanded column: mounted at final geometry from the first frame, no
  // transform ever. Invisible through grow + hold, then fades in exactly as
  // the compact column fades out.
  const enterAnimate = isAnimating
    ? { opacity: [0, 1] }
    : { opacity: 1 }
  const enterTransition = isAnimating
    ? {
        delay: crossfadeDelay,
        duration: EXPAND.crossfadeDuration,
        ease: 'linear',
      }
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
        style={{ minHeight: showExpanded ? 'auto' : '100vh' }}
      >
        {showExpanded && (
          <motion.div
            ref={expandedRef}
            className="mx-auto"
            style={{
              width: expandedConfig.contentWidth,
              maxWidth: expandedConfig.contentMaxWidth || 'none',
            }}
            initial={false}
            animate={enterAnimate}
            transition={enterTransition}
          >
            <BlockEntranceProvider suppress>
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={slug}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <CaseStudyBody slug={slug} />
                </motion.div>
              </AnimatePresence>
            </BlockEntranceProvider>
          </motion.div>
        )}

        {showCompact && (
          <>
            <div
              className="fixed"
              style={{
                left: '50%',
                top: compactConfig.containerVerticalOffset,
                width: compactConfig.containerWidth,
                maxWidth: compactConfig.containerMaxWidth,
                height: compactConfig.containerHeight,
                maxHeight: compactConfig.containerMaxHeight,
                borderRadius: compactConfig.containerBorderRadius,
                zIndex: 5,
                transform: 'translateX(-50%)',
                // Un-clip during the grow: the block column expands past the
                // container's edges while the skin fades out beneath it.
                overflow: isAnimating ? 'visible' : 'hidden',
                pointerEvents: isAnimating ? 'none' : 'auto',
              }}
            >
              {/* Skin: all of the container's paint lives here, behind the
                  blocks, so it can fade without taking the blocks with it. */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: compactConfig.containerBorderRadius,
                  borderWidth: compactConfig.containerBorderWidth,
                  borderStyle: 'solid',
                  borderColor: isScrolled ? 'transparent' : compactConfig.containerBorderColor,
                  backgroundColor: compactConfig.containerBackgroundColor,
                  backdropFilter: `blur(${compactConfig.containerBackdropBlur})`,
                  boxShadow: compactConfig.containerBoxShadow,
                  transformOrigin: 'top center',
                }}
                animate={skinAnimate}
                transition={skinTransition}
              />
              <div
                ref={scrollContainerRef}
                className="relative flex flex-col case-study-scroll h-full w-full"
                style={{
                  paddingTop: compactConfig.contentPaddingTop,
                  paddingRight: compactConfig.contentPaddingRight,
                  paddingBottom: compactConfig.contentPaddingBottom,
                  paddingLeft: compactConfig.contentPaddingLeft,
                  gap: compactConfig.contentGap,
                  overflowY: isAnimating ? 'visible' : 'auto',
                  overflowX: isAnimating ? 'visible' : 'hidden',
                }}
              >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    ref={compactContentRef}
                    key={slug}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate={blockMorphAnimate || 'center'}
                    exit="exit"
                    transition={isAnimating ? blockMorphTransition : transition}
                    drag={isAnimating ? false : 'x'}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    style={{
                      cursor: 'grab',
                      transformOrigin: 'top center',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
                    onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
                  >
                    <CaseStudyBody
                      slug={slug}
                      expandButton={<ExpandButton onToggleExpand={handleToggleExpand} />}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {isScrolled && (
              <motion.div
                className="fixed pointer-events-none"
                style={{
                  left: '50%',
                  top: compactConfig.containerVerticalOffset,
                  width: compactConfig.containerWidth,
                  maxWidth: compactConfig.containerMaxWidth,
                  height: compactConfig.containerHeight,
                  maxHeight: compactConfig.containerMaxHeight,
                  borderRadius: compactConfig.containerBorderRadius,
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
                  top: compactConfig.containerVerticalOffset,
                  width: compactConfig.containerWidth,
                  maxWidth: compactConfig.containerMaxWidth,
                  height: compactConfig.containerHeight,
                  maxHeight: compactConfig.containerMaxHeight,
                  borderRadius: compactConfig.containerBorderRadius,
                  borderWidth: compactConfig.containerBorderWidth,
                  borderStyle: 'solid',
                  borderColor: compactConfig.containerBorderColor,
                  zIndex: 7,
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