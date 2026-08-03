import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'
import ProgressiveBlur from '../components/core/ProgressiveBlur'
import CaseStudyPeek, { getCoverUrl } from '../components/CaseStudyPeek'
import { BlockEntranceProvider } from '../context/BlockEntranceContext'

const EXPAND = {
  ease: [0.4, 0, 0.2, 1], // matches easings.easeDefault
  growDuration: 0.6,
  holdDuration: 0.1,
  crossfadeDuration: 0.1,
  skinExitScale: 1.05,
  skinExitDuration: 0.3,
  swapMs: 800, // must cover (grow + hold + crossfade) * 1000
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

// Overlay proxies for the navigation morph. Two leaf cards (skin + cover
// image, no block content, no backdrop-filter) travel between the measured
// peek-card rects and the container rect, then fade out over the real
// elements already sitting at their destinations.
//
// These animate real width/height, not scale — both endpoints share the
// 60px corner radius family, and scaling would distort the corners. The
// proxies are leaves, so per-frame layout is cheap. Same deliberate
// exception to the no-layout-animation rule as the expand block morph.
//
// role="grow":   cover fully visible at departure, fades out during the
//                latter part of the flight so the proxy ARRIVES as a bare
//                gray container skin (border + shadow, no image), then the
//                whole proxy crossfades with the real container beneath it.
// role="shrink": the mirror — departs container-gray, cover fades in as it
//                travels, lands as a full cover card on the peek slot.
function NavMorphProxy({ role, from, to, fromRadius, toRadius, coverUrl, config }) {
  const nm = config.navMorph
  const geo = { duration: nm.growDuration, ease: nm.ease }

  const imageInitial = { opacity: role === 'grow' ? 1 : 0 }
  const imageAnimate = { opacity: role === 'grow' ? 0 : 1 }
  const imageTransition =
    role === 'grow'
      ? {
          delay: nm.growDuration * nm.coverFadeStart,
          duration: nm.growDuration * (1 - nm.coverFadeStart),
          ease: nm.ease,
        }
      : { duration: nm.growDuration * (1 - nm.coverFadeStart), ease: nm.ease }

  return (
    <motion.div
      initial={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: fromRadius,
        opacity: 1,
      }}
      animate={{
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        borderRadius: toRadius,
        opacity: 0,
      }}
      transition={{
        top: geo,
        left: geo,
        width: geo,
        height: geo,
        borderRadius: geo,
        opacity: { delay: nm.growDuration, duration: nm.proxyFadeDuration, ease: 'linear' },
      }}
      style={{
        position: 'absolute',
        overflow: 'hidden',
        // Solid fill, deliberately NOT the translucent container color and
        // NOT backdrop-filtered — two extra backdrop roots in flight is a
        // compositing bill with wrong sampling mid-travel anyway. Behind
        // the container it lands on sits the plain gray page, so solid
        // #F2F2F2 with the container's border + shadow reads as the same
        // surface at the crossfade.
        backgroundColor: '#F2F2F2',
        border: `${config.containerBorderWidth} solid ${config.containerBorderColor}`,
        boxShadow: config.containerBoxShadow,
        willChange: 'top, left, width, height',
      }}
    >
      {coverUrl && (
        <motion.img
          src={coverUrl}
          alt=""
          draggable={false}
          initial={imageInitial}
          animate={imageAnimate}
          transition={imageTransition}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </motion.div>
  )
}

function NavMorphOverlay({ navMorph, config }) {
  const containerRadius = parseFloat(config.containerBorderRadius)
  const peekRadius = containerRadius * config.peek.scale

  return (
    <div className="fixed inset-0" style={{ zIndex: 8, pointerEvents: 'none' }}>
      {/* Outgoing study's cover: container rect -> opposite peek rect. */}
      <NavMorphProxy
        role="shrink"
        from={navMorph.container}
        to={navMorph.shrinkTo}
        fromRadius={containerRadius}
        toRadius={peekRadius}
        coverUrl={getCoverUrl(navMorph.leavingStudy)}
        config={config}
      />
      {/* Incoming study's cover: its peek rect -> container rect. */}
      <NavMorphProxy
        role="grow"
        from={navMorph.growFrom}
        to={navMorph.container}
        fromRadius={peekRadius}
        toRadius={containerRadius}
        coverUrl={getCoverUrl(navMorph.enteringStudy)}
        config={config}
      />
    </div>
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

  const [morph, setMorph] = useState(null)

  // Navigation morph state: measured at click time, before navigate(),
  // so all rects are frozen truth from the pre-navigation layout. Null
  // when no morph is running.
  const [navMorph, setNavMorph] = useState(null)
  const navMorphTimerRef = useRef(null)
  const containerRef = useRef(null)
  const prevPeekCardRef = useRef(null)
  const nextPeekCardRef = useRef(null)

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ).current

  const showExpanded = isExpanded || isAnimating
  const showCompact = !isExpanded

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
    return () => {
      clearTimeout(expandTimerRef.current)
      clearTimeout(navMorphTimerRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isAnimating) return
    const c = compactContentRef.current?.getBoundingClientRect()
    const x = expandedRef.current?.getBoundingClientRect()
    if (!c || !x || !c.width || !x.width) return

    setMorph({
      fromWidth: c.width,
      toWidth: x.width,
      dx: x.left - c.left,
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

      if (e.key === 'ArrowLeft' && hasNeighbors) {
        navigateToPrev()
      } else if (e.key === 'ArrowRight' && hasNeighbors) {
        navigateToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // navMorph and isAnimating are read by the navigate functions' guards —
    // omitting them leaves stale closures that ignore an in-flight morph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNeighbors, prevSlug, nextSlug, navMorph, isAnimating])

  function rectOf(ref) {
    const r = ref.current?.getBoundingClientRect()
    if (!r || !r.width) return null
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }

  // Measure everything the morph needs BEFORE navigate(). By the time React
  // re-renders for the new slug, the pre-navigation geometry is already
  // frozen in state — no measuring across a route change.
  // Returns false when measurement isn't possible (expanded view, first
  // paint, reduced motion), in which case navigation falls back to the
  // plain slide.
  function beginNavMorph(dir) {
    if (prefersReducedMotion) return false
    const container = rectOf(containerRef)
    const growFrom = rectOf(dir > 0 ? nextPeekCardRef : prevPeekCardRef)
    const shrinkTo = rectOf(dir > 0 ? prevPeekCardRef : nextPeekCardRef)
    const enteringStudy = dir > 0 ? nextStudy : prevStudy
    if (!container || !growFrom || !shrinkTo || !enteringStudy || !currentStudy) {
      return false
    }
    clearTimeout(navMorphTimerRef.current)
    setNavMorph({
      dir,
      container,
      growFrom,
      shrinkTo,
      enteringStudy,
      leavingStudy: currentStudy,
    })
    navMorphTimerRef.current = setTimeout(
      () => setNavMorph(null),
      compactConfig.navMorph.totalMs
    )
    return true
  }

  function navigateToPrev(opts = {}) {
    if (!prevSlug || isAnimating || navMorph) return
    const { morph = true } = opts
    if (morph && showCompact) beginNavMorph(-1)
    setDirection(-1)
    navigate(`/work/${prevSlug}`, { replace: true })
  }

  function navigateToNext(opts = {}) {
    if (!nextSlug || isAnimating || navMorph) return
    const { morph = true } = opts
    if (morph && showCompact) beginNavMorph(1)
    setDirection(1)
    navigate(`/work/${nextSlug}`, { replace: true })
  }

  function handleToggleExpand() {
    if (isAnimating || isExpanded || navMorph) return
    setMorph(null)
    setIsAnimating(true)
    expandTimerRef.current = setTimeout(() => {
      setIsExpanded(true)
      setIsAnimating(false)
    }, EXPAND.swapMs)
  }

  function handleDragEnd(_e, info) {
    if (isExpanded || isAnimating || navMorph) return

    const threshold = 80
    const velocity = info.velocity.x

    if (info.offset.x > threshold || velocity > 300) {
      if (hasNeighbors) {
        // Drag keeps the classic slide: the content is already displaced
        // under the pointer, and a proxy departing from an undisplaced
        // rect would visibly disagree with it.
        navigateToPrev({ morph: false })
      }
    } else if (info.offset.x < -threshold || velocity < -300) {
      if (hasNeighbors) {
        navigateToNext({ morph: false })
      }
    }
  }

  // Peek slot offset for entry animation: just the reveal width since peeks are at screen edges
  const slotOffset = 100 // matches peek revealWidth

  // Slug-swap content variants. `custom` is an object (not the bare
  // direction) because exiting children only receive updates through
  // AnimatePresence's `custom` prop — the morphing flag must reach them
  // that way, or exits use the previous render's variants and slide when
  // they should fade.
  const morphCustom = { dir: direction, morphing: Boolean(navMorph) }

  const variants = {
    enter: (c) =>
      c.morphing
        ? { x: 0, opacity: 0 }
        : { x: c.dir > 0 ? slotOffset : -slotOffset, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: (c) =>
      c.morphing
        ? {
            x: 0,
            opacity: 0,
            transition: {
              duration: CASE_STUDY_LAYOUT.compact.navMorph.contentExitDuration,
              ease: 'linear',
            },
          }
        : { x: c.dir > 0 ? -slotOffset : slotOffset, opacity: 0 },
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

  // Incoming content during a nav morph: fade-in only, timed to be fully
  // present just before the growing proxy fades out on top of it.
  const navContentTransition = {
    delay: compactConfig.navMorph.contentEnterDelay,
    duration: compactConfig.navMorph.contentEnterDuration,
    ease: compactConfig.navMorph.ease,
  }

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

  const blockMorphAnimate =
    isAnimating && morph
      ? {
          width: [morph.fromWidth, morph.toWidth],
          x: morph.dx,
          y: morph.dy,
          opacity: 0,
        }
      : null // fall through to the normal slug-swap variants
  const blockMorphTransition = {
    width: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    x: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    y: { duration: EXPAND.growDuration, ease: EXPAND.ease },
    opacity: {
      delay: crossfadeDelay,
      duration: EXPAND.crossfadeDuration,
      ease: 'linear',
    },
  }

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
        style={{
          minHeight: showExpanded ? 'auto' : '100vh',
          paddingBottom: showExpanded ? '15vh' : undefined,
        }}
      >
        {showExpanded && (
          <>
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
                <AnimatePresence initial={false} custom={morphCustom} mode="wait">
                  <motion.div
                    key={slug}
                    custom={morphCustom}
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

            <div
              className="fixed pointer-events-none left-0 right-0"
              style={{
                top: 0,
                zIndex: 10,
              }}
            >
              <ProgressiveBlur />
            </div>
          </>
        )}

        {showCompact && (
          <>
            <div
              className="fixed flex items-start justify-between"
              style={{
                left: 0,
                right: 0,
                top: compactConfig.containerVerticalOffset,
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <CaseStudyPeek
                ref={prevPeekCardRef}
                side="prev"
                study={prevStudy}
                config={compactConfig}
                isAnimating={isAnimating}
                navMorph={navMorph}
                onClick={() => navigateToPrev()}
              />

              <div
                ref={containerRef}
                className="relative"
                style={{
                  width: compactConfig.containerWidth,
                  maxWidth: compactConfig.containerMaxWidth,
                  height: compactConfig.containerHeight,
                  maxHeight: compactConfig.containerMaxHeight,
                  borderRadius: compactConfig.containerBorderRadius,
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
                <AnimatePresence initial={false} custom={morphCustom} mode="wait">
                  <motion.div
                    ref={compactContentRef}
                    key={slug}
                    custom={morphCustom}
                    variants={variants}
                    initial="enter"
                    animate={blockMorphAnimate || 'center'}
                    exit="exit"
                    transition={
                      isAnimating
                        ? blockMorphTransition
                        : navMorph
                          ? navContentTransition
                          : transition
                    }
                    drag={isAnimating || navMorph ? false : 'x'}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    style={{
                      cursor: 'grab',
                      transformOrigin: 'top left',
                      flexShrink: 0,
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

              <CaseStudyPeek
                ref={nextPeekCardRef}
                side="next"
                study={nextStudy}
                config={compactConfig}
                isAnimating={isAnimating}
                navMorph={navMorph}
                onClick={() => navigateToNext()}
              />
            </div>

            {navMorph && (
              <NavMorphOverlay navMorph={navMorph} config={compactConfig} />
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