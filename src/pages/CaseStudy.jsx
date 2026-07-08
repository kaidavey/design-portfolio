import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'

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

// Control buttons (prev/next/expand/close)
function CaseStudyControls({ hasPrev, hasNext, isExpanded, onPrev, onNext, onToggleExpand, onClose }) {
  const buttonBaseClass = "w-[50px] h-[50px] rounded-full flex items-center justify-center border border-[#F1F1F1] hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
  const buttonBgClass = "bg-[radial-gradient(ellipse_96.655%_118.59%_at_50%_34.53%,oklch(97%_0_0)_45.01%,oklch(77.6%_0_0)_100%)] [box-shadow:rgba(0,0,0,0.1)_0px_-1px_1px_inset,#FFFFFF_-1px_1px_0px_inset]"

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Prev/Next */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous case study"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <ChevronLeft className="w-5 h-5 text-[#2F2F2F]" strokeWidth={2} />
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next case study"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <ChevronRight className="w-5 h-5 text-[#2F2F2F]" strokeWidth={2} />
        </button>
      </div>

      {/* Right: Expand/Close */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-[#2F2F2F]" strokeWidth={2} />
          ) : (
            <Maximize2 className="w-4 h-4 text-[#2F2F2F]" strokeWidth={2} />
          )}
        </button>
        <button
          onClick={onClose}
          aria-label="Close and return to work"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <X className="w-5 h-5 text-black" strokeWidth={2.5} />
        </button>
      </div>
    </div>
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
    setIsExpanded(!isExpanded)
  }

  function handleClose() {
    navigate('/')
  }

  function handleDragEnd(_e, info) {
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

  return (
    <Shell
      header={<CaseStudyNavigation title={currentStudy?.title} />}
      isExpanded={isExpanded}
    >
      {/* Gray rounded container holding controls + content */}
      <div className="flex items-center justify-center w-full">
        <div
          className="flex flex-col items-center gap-12 p-12 rounded-tl-[70px] rounded-tr-[70px] [backdrop-filter:blur(8px)] [box-shadow:rgba(255,255,255,0.5)_-2px_2px_0px_inset,rgba(0,0,0,0.05)_-6px_20px_30px_1px] bg-[rgba(240,240,240,0.8)] border-t-2 border-l-2 border-r-2 border-[#D8D8D8]"
          style={{
            width: 'clamp(700px, 95%, 1100px)'
          }}
        >
          {/* Controls at top of container */}
          <CaseStudyControls
            hasPrev={hasPrev}
            hasNext={hasNext}
            isExpanded={isExpanded}
            onPrev={navigateToPrev}
            onNext={navigateToNext}
            onToggleExpand={handleToggleExpand}
            onClose={handleClose}
          />

          {/* Case study content with swipe animation */}
          <div className="relative overflow-hidden w-full">
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
                ref={scrollContainerRef}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
                onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
              >
                <CaseStudyBody slug={slug} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Shell>
  )
}
