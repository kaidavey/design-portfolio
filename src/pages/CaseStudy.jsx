import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'
import ProgressiveBlur from '../components/core/ProgressiveBlur'

// Centered breadcrumb navigation
function CaseStudyNavigation({ title }) {
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Breadcrumb">
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-[18px] hover:text-[#2F2F2F] transition-colors"
      >
        Home
      </Link>
      <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-[18px]">
        /
      </span>
      <Link
        to="/"
        className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-[18px] hover:text-[#2F2F2F] transition-colors"
      >
        Work
      </Link>
      {title && (
        <>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-[18px]">
            /
          </span>
          <span className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-black text-[18px] font-medium">
            {title}
          </span>
        </>
      )}
    </nav>
  )
}

// Expand button - only shown in compact mode (icon only, no frame)
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
  const [direction, setDirection] = useState(0)
  const scrollContainerRef = useRef(null)

  // Get current index and neighbors
  const currentIndex = caseStudies.findIndex((cs) => cs.slug.current === slug)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < caseStudies.length - 1
  const prevSlug = hasPrev ? caseStudies[currentIndex - 1].slug.current : null
  const nextSlug = hasNext ? caseStudies[currentIndex + 1].slug.current : null

  const currentStudy = caseStudies[currentIndex]

  // Prefetch neighbors
  useNeighborPrefetch(slug, caseStudies)

  // Reset scroll to top when slug changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [slug])

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if focus is in input/textarea
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
    setIsExpanded(true)
  }

  function handleDragEnd(_e, info) {
    // Only allow swipe in compact mode
    if (isExpanded) return

    const threshold = 80
    const velocity = info.velocity.x

    if (info.offset.x > threshold || velocity > 300) {
      // Dragged right = go to previous
      if (hasPrev) {
        navigateToPrev()
      }
    } else if (info.offset.x < -threshold || velocity < -300) {
      // Dragged left = go to next
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

  // Get layout config
  const layoutConfig = isExpanded ? CASE_STUDY_LAYOUT.expanded : CASE_STUDY_LAYOUT.compact

  return (
    <Shell
      header={<CaseStudyNavigation title={currentStudy?.title} />}
      isExpanded={isExpanded}
      preventScroll={!isExpanded}
    >
      <div className="relative w-full pt-[64px]" style={{ minHeight: isExpanded ? 'auto' : '100vh' }}>
        {isExpanded ? (
          /* EXPANDED MODE: No gray container, content directly on page */
          <div
            className="mx-auto"
            style={{
              width: layoutConfig.contentWidth,
              maxWidth: layoutConfig.contentMaxWidth || 'none',
            }}
          >
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
          </div>
        ) : (
          /* COMPACT MODE: Gray container fixed to bottom */
          <>
            {/* Gray container */}
            <div
              ref={scrollContainerRef}
              className="fixed left-1/2 bottom-0 flex flex-col items-center px-9 py-10 rounded-tl-[70px] rounded-tr-[70px] [backdrop-filter:blur(8px)] [box-shadow:rgba(255,255,255,0.5)_-2px_2px_0px_inset,rgba(0,0,0,0.05)_-6px_20px_30px_1px] bg-[rgba(240,240,240,0.8)] border-t-2 border-l-2 border-r-2 border-[#D8D8D8] overflow-y-auto overflow-x-hidden case-study-scroll relative"
              style={{
                width: layoutConfig.containerWidth,
                maxWidth: layoutConfig.containerMaxWidth || 'none',
                height: layoutConfig.containerHeight,
                transform: 'translateX(-50%)',
                zIndex: 5, // Below dock (z-index: 10) but above background
              }}
            >
              {/* Content area wrapper - button positioned relative to this */}
              <div
                className="relative w-full"
                style={{
                  width: layoutConfig.contentWidthPercent,
                  paddingTop: layoutConfig.contentPaddingTop,
                  paddingBottom: layoutConfig.contentPaddingBottom,
                }}
              >
              {/* Expand button at top-right of content area, vertically centered with first block */}
              <div
                className="absolute right-0 z-10"
                style={{
                  top: '36px' // Offset to vertically center with ~50px Hero block
                }}
              >
                <ExpandButton onToggleExpand={handleToggleExpand} />
              </div>

              {/* Content */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={slug}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: 'grab' }}
                  onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
                  onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
                >
                  <CaseStudyBody slug={slug} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Blur overlay wrapper - fixed to match gray container position */}
          <div
            className="fixed left-1/2 bottom-0 rounded-tl-[70px] rounded-tr-[70px] pointer-events-none"
            style={{
              width: layoutConfig.containerWidth,
              maxWidth: layoutConfig.containerMaxWidth || 'none',
              height: layoutConfig.containerHeight,
              transform: 'translateX(-50%)',
              zIndex: 6, // Above gray container (z-index: 5) to overlay the blur
            }}
          >
            <ProgressiveBlur />
          </div>
        </>
        )}
      </div>
    </Shell>
  )
}
