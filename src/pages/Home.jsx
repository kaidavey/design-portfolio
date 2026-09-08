import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCaseStudies } from '../hooks/useCaseStudies'
import { prefetchCaseStudy } from '../lib/queries'
import { stageOpenMorph } from '../lib/openMorphBaton'
import { HOME_LAYOUT } from '../config/homeLayout'
import Shell from '../components/Shell'
import NowPlaying from '../components/NowPlaying'
import CaseStudyCover from '../components/CaseStudyCover'
import ProgressiveBlur from '../components/core/ProgressiveBlur'

const COVER_RADIUS = parseFloat(HOME_LAYOUT.cover.borderRadius)

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
function CaseStudyCard({ caseStudy }) {
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
            <CaseStudyCard key={caseStudy._id} caseStudy={caseStudy} />
          ))}
        </div>
      )}
    </Shell>
  )
}
