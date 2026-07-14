import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useCaseStudies } from '../hooks/useCaseStudies'
import { urlFor } from '../lib/sanity'
import Shell from '../components/Shell'
import NowPlaying from '../components/NowPlaying'

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
        <h1 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-[28px]/8.5">
          Kai Davey
        </h1>
        <p className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-xl/6">
          Design Engineer & CS at UCLA
        </p>
      </div>

      {/* Right: Location and music status */}
      <div className="flex flex-col items-end gap-2">
        {/* Location status */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-[18px] h-[18px] text-[#0000004D]" strokeWidth={1.5} />
          <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-lg/5.5">
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
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-lg text-gray-400">Loading case studies...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-9 py-[48px]">
          {caseStudies.map((caseStudy) => (
            <Link
              key={caseStudy._id}
              to={`/work/${caseStudy.slug.current}`}
              className="group flex flex-col items-start gap-4"
            >
              {/* Cover Image - separate white card */}
              {caseStudy.coverImage && (
                <div className="w-full aspect-[455/328] rounded-[30px] overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  <img
                    src={urlFor(caseStudy.coverImage).width(800).height(580).url()}
                    alt={caseStudy.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Title below - not in a card */}
              <div className="flex items-start gap-2">
                <h2 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-lg/5.5">
                  {caseStudy.title}
                </h2>
                {caseStudy.description && (
                  <>
                    <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-lg/5.5">
                      /
                    </span>
                    <span className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-lg/5.5">
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
