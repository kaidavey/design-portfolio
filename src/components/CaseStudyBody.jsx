import { useState } from 'react'
import { X } from 'lucide-react'
import { useCaseStudy } from '../hooks/useCaseStudies'
import { urlFor } from '../lib/sanity'
import BlockRenderer from './BlockRenderer'

export default function CaseStudyBody({ slug }) {
  const { caseStudy, loading, error } = useCaseStudy(slug)
  const [showViewSolution, setShowViewSolution] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!caseStudy) {
    return null
  }

  // Check if we have metadata to display
  const hasMetadata = caseStudy.role || caseStudy.timeline || caseStudy.team || caseStudy.tools

  return (
    <div className="space-y-12">
      {/* Case Study Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Optional logo/icon placeholder - can be populated from Sanity if available */}
          <div className="w-[50px] h-[50px] shrink-0" />
          <h1 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-[28px]">
            {caseStudy.title}
          </h1>
        </div>
        {caseStudy.year && (
          <p className="tracking-[-0.02em] opacity-90 font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-2xl">
            {caseStudy.year}
          </p>
        )}
      </div>

      {/* Metadata Row */}
      {hasMetadata && (
        <div className="flex items-start gap-5 justify-between">
          {caseStudy.role && (
            <div className="flex flex-col items-start gap-2">
              <div className="tracking-[-0.02em] uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm">
                Role
              </div>
              <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg">
                {caseStudy.role}
              </div>
            </div>
          )}
          {caseStudy.timeline && (
            <div className="flex flex-col items-start gap-2">
              <div className="tracking-[-0.02em] uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm">
                Timeline
              </div>
              <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg">
                {caseStudy.timeline}
              </div>
            </div>
          )}
          {caseStudy.team && (
            <div className="flex flex-col items-start gap-2">
              <div className="tracking-[-0.02em] uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm">
                Team
              </div>
              <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg">
                {caseStudy.team}
              </div>
            </div>
          )}
          {caseStudy.tools && (
            <div className="flex flex-col items-start gap-2">
              <div className="tracking-[-0.02em] uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm">
                Tools
              </div>
              <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg">
                {caseStudy.tools}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Solution Callout */}
      {showViewSolution && (
        <div className="flex overflow-clip rounded-[20px] items-center px-6 py-5 justify-between [box-shadow:#FFFFFF_-1px_2px_0px_inset] bg-[#F2F2F2] border border-solid border-[#DEDEDE]">
          <div className="flex flex-col items-start gap-2">
            <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-base">
              View Solution
            </div>
            <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base">
              If you're ready to see the solution, skip ahead.
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                // Scroll to solution section (if exists)
                const solutionSection = document.querySelector('[data-solution]')
                if (solutionSection) {
                  solutionSection.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="flex overflow-clip rounded-xl flex-col items-start gap-1.5 px-3.5 py-1.5 [box-shadow:#FFFFFF_0px_1px_0px_inset] bg-origin-border border border-solid border-[#E0E0E0] hover:bg-[#F8F8F8] transition-colors"
              style={{
                backgroundImage:
                  'linear-gradient(in oklab 0deg, oklab(95.5% 0 0) -8.17%, oklab(97.5% 0 0) 77.61%)',
              }}
            >
              <div className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-base">
                Skip to Solution
              </div>
            </button>
            <button
              onClick={() => setShowViewSolution(false)}
              aria-label="Dismiss"
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4 text-[#0000004D]" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Case Study Body - Blocks adapt to container via @container queries */}
      <BlockRenderer blocks={caseStudy.body} />
    </div>
  )
}
