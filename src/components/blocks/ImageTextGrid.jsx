import CaseStudyMedia from '../CaseStudyMedia'

/**
 * ImageTextGrid - Two or three columns, each an image above a text card.
 *
 * The image slot holds a `caseStudyImage`, so a column can show a framed
 * device shot instead of a plain image.
 */
export default function ImageTextGrid({ block }) {
  const columns = block.columns || []

  return (
    <div
      className={`flex flex-col @md:flex-row items-stretch justify-center w-full antialiased ${
        columns.length === 3 ? 'gap-4' : 'gap-6'
      }`}
    >
      {columns.map((column, index) => (
        <div key={column._key || index} className="flex flex-col items-start gap-4 self-stretch flex-1">
          {/* min-h-0 keeps the flexed image from being floored at its own
              intrinsic height once the aspect ratio is known. */}
          <CaseStudyMedia
            media={column.media}
            sizes="(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px"
            maxWidth={880}
            fillClassName="rounded-[20px] self-stretch flex-1 min-h-0 object-cover"
          />
          {column.media?.caption && (
            <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-caption">
              {column.media.caption}
            </div>
          )}
          <div className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 self-stretch [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] transition-all duration-300">
            <div className="flex flex-col items-start gap-2 self-stretch">
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-body leading-[1.25rem]">
                {column.subtitle}
              </div>
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
                {column.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
