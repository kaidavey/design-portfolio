import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCaseStudies } from '../hooks/useCaseStudies'
import { prefetchCaseStudy } from '../lib/queries'
import { stageOpenMorph, readCloseMorph } from '../lib/morphBaton'
import { useMorphArrival } from '../hooks/useMorphArrival'
import { HOME_LAYOUT } from '../config/homeLayout'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
import Shell from '../components/Shell'
import MorphOverlay from '../components/MorphOverlay'
import NowPlaying from '../components/NowPlaying'
import CaseStudyCover from '../components/CaseStudyCover'
import ProgressiveBlur from '../components/core/ProgressiveBlur'

const COVER_RADIUS = parseFloat(HOME_LAYOUT.cover.borderRadius)
const COMPACT = CASE_STUDY_LAYOUT.compact

/**
 * Put Home back where the reader left it, as a cut.
 *
 * index.css sets `scroll-behavior: smooth` on html, which makes a plain
 * scrollTo ANIMATE — the cover would still be sliding while the proxy tried to
 * land on it, and the rect measured a moment later would already be stale. An
 * inline `auto` overrides the stylesheet for the length of the call, which
 * also makes the scroll synchronous, so the measurement that follows sees the
 * final position and any clamping the browser applied to it.
 */
function restoreScroll(top) {
  const html = document.documentElement
  const previous = html.style.scrollBehavior

  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, top)
  html.style.scrollBehavior = previous
}

/**
 * Where the returning container lands, and what it is carrying by the time it
 * gets there. Read off the real cover, concealed but rendered: its `<img>` is
 * showing bytes the browser already has, which is the only artwork the proxy
 * can paint without a blank frame while a second URL downloads.
 *
 * Home's scroll is restored first, as a cut. The rect has to be the one the
 * reader will actually see the cover at, and a fresh Home starts at the top
 * however far down the page they were when they left.
 */
function measureCoverDestination({ slug, homeScroll }) {
  restoreScroll(homeScroll)

  const cover = document.querySelector(`[data-cover-slug="${CSS.escape(slug)}"]`)
  const rect = cover?.getBoundingClientRect()
  if (!rect?.width) return null

  const image = cover.querySelector('img')

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    radius: COVER_RADIUS,
    src: image?.currentSrc || image?.src || null,
  }
}

// Home header slot: Bio + Status
function HomeHeader() {
  // Get current time for Seattle timezone
  const seattleTime = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left: Name and title */}
      <div className="flex flex-col items-start gap-2.5">
        <h1 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-fluid-heading">
          Kai Davey
        </h1>
        <p className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-fluid-subheading-alt">
          Design Engineer & CS at UCLA
        </p>
      </div>

      {/* Right: Location and music status */}
      <div className="flex flex-col items-end gap-2">
        {/* Location status */}
        <div className="flex items-center gap-1.5">
          <svg className="w-[18px] h-[18px] [color:var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-meta-value leading-[1.375rem]">
            Seattle · {seattleTime}
          </span>
        </div>

        {/* Music status */}
        <NowPlaying track="Breathe" artist="Malcolm Todd" isPlaying />
      </div>
    </div>
  )
}

/**
 * One case study on the grid, and the departure end of the open morph.
 *
 * The cover is measured on the click itself rather than up front: it moves
 * with scroll, with the viewport, and with its own hover scale, and only the
 * rect it occupied at the moment of the click is the one the morph should
 * leave from.
 */
function CaseStudyCard({ caseStudy, concealed }) {
  const coverRef = useRef(null)
  const slug = caseStudy.slug.current

  // A modified click opens a new tab, where there is no morph to hand off to,
  // and a staged origin would then be waiting to fire on some later visit.
  function handleClick(event) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    stageOpenMorph(slug, coverRef.current, COVER_RADIUS)
  }

  // Warm the body before the morph needs it: the proxy lands on the container
  // roughly half a second from here, and what it uncovers should be the study,
  // not its skeleton.
  const warm = () => prefetchCaseStudy(slug)

  return (
    <Link
      to={`/work/${slug}`}
      className="group flex flex-col items-start gap-4"
      onClick={handleClick}
      onPointerEnter={warm}
      onPointerDown={warm}
      onFocus={warm}
    >
      {/* Cover - supports both image and video */}
      {caseStudy.coverImage && (
        <CaseStudyCover
          ref={coverRef}
          data-cover-slug={slug}
          // Concealed while the returning container is still in the air. A
          // cover already sitting at the destination reads as a second card.
          style={concealed ? { visibility: 'hidden' } : undefined}
          coverImage={caseStudy.coverImage}
          coverVideo={caseStudy.coverVideo}
          alt={caseStudy.title}
          sizes="(max-width: 640px) 92vw, (max-width: 900px) 45vw, 440px"
          maxWidth={880}
        />
      )}

      {/* Title below - not in a card */}
      <div className="flex items-start gap-2">
        <h2 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-primary)] text-meta-value leading-[1.375rem]">
          {caseStudy.title}
        </h2>
        {caseStudy.description && (
          <>
            <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-meta-value leading-[1.375rem]">
              /
            </span>
            <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-meta-value leading-[1.375rem]">
              {caseStudy.description}
            </span>
          </>
        )}
      </div>
    </Link>
  )
}

export default function Home() {
  const { caseStudies, loading } = useCaseStudies()

  // Arrival from a case study: the container the reader just closed, flying
  // back down into its cover. Unlike the outbound morph nothing else on the
  // page is hidden — the home screen is meant to be there, being returned to.
  const closeMorph = useMorphArrival({
    read: readCloseMorph,
    measureDest: measureCoverDestination,
    config: COMPACT.closeMorph,
  })

  return (
    <Shell header={<HomeHeader />} isHome={true}>
      {/* Progressive blur at top of page */}
      <div
        className="fixed pointer-events-none left-0 right-0"
        style={{
          top: 0,
          zIndex: 10,
        }}
      >
        <ProgressiveBlur />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-lg text-gray-400">Hold tight...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-9 pt-[36px] pb-[128px]">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard
              key={caseStudy._id}
              caseStudy={caseStudy}
              concealed={
                closeMorph.concealed && closeMorph.origin.slug === caseStudy.slug.current
              }
            />
          ))}
        </div>
      )}

      {closeMorph.active && (
        <MorphOverlay
          from={closeMorph.origin}
          to={closeMorph.dest}
          artwork={{ src: closeMorph.dest.src }}
          resolving
          config={COMPACT.closeMorph}
          skin={COMPACT}
        />
      )}
    </Shell>
  )
}
