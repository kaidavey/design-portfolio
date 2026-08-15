import { Link } from 'react-router-dom'
import { useCaseStudies } from '../hooks/useCaseStudies'
import Shell from '../components/Shell'
import NowPlaying from '../components/NowPlaying'
import CaseStudyImage from '../components/CaseStudyImage'
import ProgressiveBlur from '../components/core/ProgressiveBlur'

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
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-9 py-[36px]">
          {caseStudies.map((caseStudy) => (
            <Link
              key={caseStudy._id}
              to={`/work/${caseStudy.slug.current}`}
              className="group flex flex-col items-start gap-4"
            >
              {/* Cover Image - separate white card */}
              {caseStudy.coverImage && (
                <div className="w-full aspect-[455/328] rounded-[30px] overflow-hidden [background-color:var(--color-bg-container-solid)] shadow-md hover:shadow-xl transition-all duration-300">
                  <CaseStudyImage
                    source={caseStudy.coverImage}
                    alt={caseStudy.title}
                    sizes="(max-width: 640px) 92vw, (max-width: 900px) 45vw, 440px"
                    maxWidth={880}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
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
          ))}
        </div>
      )}
    </Shell>
  )
}
