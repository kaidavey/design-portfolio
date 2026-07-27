import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2 } from 'lucide-react'
import { useCaseStudies, useNeighborPrefetch } from '../hooks/useCaseStudies'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import Shell from '../components/Shell'
import CaseStudyBody from '../components/CaseStudyBody'
import ProgressiveBlur from '../components/core/ProgressiveBlur'

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
  const [isScrolled, setIsScrolled] = useState(false)
  const scrollContainerRef = useRef(null)

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
    setIsExpanded(true)
  }

  function handleDragEnd(_e, info) {
    if (isExpanded) return

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

  const layoutConfig = isExpanded ? CASE_STUDY_LAYOUT.expanded : CASE_STUDY_LAYOUT.compact

  return (
    <Shell
      header={
        <div style={{ visibility: 'hidden' }}>
          <CaseStudyNavigation title={currentStudy?.title} />
        </div>
      }
      isExpanded={isExpanded}
      preventScroll={!isExpanded}
    >
      <div className="relative w-full pt-[64px]" style={{ minHeight: isExpanded ? 'auto' : '100vh' }}>
        {isExpanded ? (
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
          <>
            <div
              className="fixed"
              style={{
                left: '50%',
                top: layoutConfig.containerVerticalOffset,
                width: layoutConfig.containerWidth,
                maxWidth: layoutConfig.containerMaxWidth,
                height: layoutConfig.containerHeight,
                maxHeight: layoutConfig.containerMaxHeight,
                transform: 'translateX(-50%)',
                borderRadius: layoutConfig.containerBorderRadius,
                borderWidth: layoutConfig.containerBorderWidth,
                borderStyle: 'solid',
                borderColor: isScrolled ? 'transparent' : layoutConfig.containerBorderColor,
                backgroundColor: layoutConfig.containerBackgroundColor,
                backdropFilter: `blur(${layoutConfig.containerBackdropBlur})`,
                boxShadow: layoutConfig.containerBoxShadow,
                zIndex: 5,
              }}
            >
              <div
                ref={scrollContainerRef}
                className="flex flex-col overflow-y-auto overflow-x-hidden case-study-scroll h-full w-full"
                style={{
                  paddingTop: layoutConfig.contentPaddingTop,
                  paddingRight: layoutConfig.contentPaddingRight,
                  paddingBottom: layoutConfig.contentPaddingBottom,
                  paddingLeft: layoutConfig.contentPaddingLeft,
                  gap: layoutConfig.contentGap,
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
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    style={{ cursor: 'grab' }}
                    onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
                    onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
                  >
                    <CaseStudyBody slug={slug} expandButton={<ExpandButton onToggleExpand={handleToggleExpand} />} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {isScrolled && (
              <div
                className="fixed pointer-events-none"
                style={{
                  left: '50%',
                  top: layoutConfig.containerVerticalOffset,
                  width: layoutConfig.containerWidth,
                  maxWidth: layoutConfig.containerMaxWidth,
                  height: layoutConfig.containerHeight,
                  maxHeight: layoutConfig.containerMaxHeight,
                  transform: 'translateX(-50%)',
                  borderRadius: layoutConfig.containerBorderRadius,
                  zIndex: 6,
                }}
              >
                <ProgressiveBlur />
              </div>
            )}

            {isScrolled && (
              <div
                className="fixed pointer-events-none"
                style={{
                  left: '50%',
                  top: layoutConfig.containerVerticalOffset,
                  width: layoutConfig.containerWidth,
                  maxWidth: layoutConfig.containerMaxWidth,
                  height: layoutConfig.containerHeight,
                  maxHeight: layoutConfig.containerMaxHeight,
                  transform: 'translateX(-50%)',
                  borderRadius: layoutConfig.containerBorderRadius,
                  borderWidth: layoutConfig.containerBorderWidth,
                  borderStyle: 'solid',
                  borderColor: layoutConfig.containerBorderColor,
                  zIndex: 7,
                }}
              />
            )}
        </>
        )}
      </div>
    </Shell>
  )
}
