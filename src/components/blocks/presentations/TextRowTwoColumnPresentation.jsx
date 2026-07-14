/**
 * TextRowTwoColumnPresentation - Pure presentation component
 *
 * Two-column text layout with optional section label and title.
 * Stacks on narrow containers, side-by-side on wide.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function TextRowTwoColumnPresentation({
  section,
  title,
  leftParagraphs = [],
  rightParagraphs = [],
}) {
  return (
    <div className="flex flex-col items-start gap-4 w-full">
      {/* Section/Title Header */}
      {(section || title) && (
        <div className="flex flex-col items-start gap-1 w-full">
          {section && (
            <div className="tracking-[-0.02em] uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm leading-[18px]">
              {section}
            </div>
          )}
          {title && (
            <h2 className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl leading-[30px]">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex flex-col @md:flex-row items-start w-full gap-6">
        {/* Left Column */}
        <div className="flex flex-col items-start gap-4 flex-1">
          <div className="flex flex-col items-start gap-2 w-full">
            {leftParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="tracking-[-0.02em] w-full font-['DM_Sans',system-ui,sans-serif] text-black text-base leading-[20px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-start gap-4 flex-1">
          <div className="flex flex-col items-start gap-2 w-full">
            {rightParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="tracking-[-0.02em] w-full font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base leading-[20px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
