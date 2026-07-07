import { Link } from 'react-router-dom'

/**
 * CaseStudyHeader - Header slot content for CaseStudy route
 *
 * Shows: Breadcrumbs + Prev/Next arrows + Expand/Close controls
 * Matches Paper design with circular buttons and radial gradients
 */
export default function CaseStudyHeader({
  title,
  hasPrev,
  hasNext,
  isExpanded,
  onPrev,
  onNext,
  onToggleExpand,
  onClose,
}) {
  // Button base styles matching Paper design
  const buttonBaseClass = "w-[50px] h-[50px] rounded-full flex items-center justify-center text-[20px] border border-[#DEDEDE] shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
  const buttonBgClass = "bg-[radial-gradient(50%_50%_at_50%_50%,#FFFFFF_0%,#F2F2F2_100%)]"

  return (
    <div className="flex items-center justify-between">
      {/* Left: Breadcrumbs */}
      <nav className="flex items-center gap-2" aria-label="Breadcrumb">
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

      {/* Right: Navigation controls */}
      <div className="flex items-center gap-3">
        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous case study"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <span className="text-black">􀆉</span>
        </button>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next case study"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <span className="text-black">􀆊</span>
        </button>

        {/* Expand/Collapse toggle */}
        <button
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <span className="text-black">{isExpanded ? '􀄰' : '􀂓'}</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close and return to work"
          className={`${buttonBaseClass} ${buttonBgClass}`}
        >
          <span className="text-black">􀆄</span>
        </button>
      </div>
    </div>
  )
}
