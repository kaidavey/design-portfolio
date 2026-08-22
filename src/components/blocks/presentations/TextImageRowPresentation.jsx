import CaseStudyMedia from '../../CaseStudyMedia'

/**
 * TextImageRowPresentation - Pure presentation component
 *
 * Text on one side, one image on the other. The image slot takes a
 * `caseStudyImage`, so it holds either a plain image or a framed device shot.
 *
 * - No Sanity coupling
 * - Plain, well-named props
 * - Sizes via container queries
 * - No mount/entrance animations
 */
export default function TextImageRowPresentation({
  title,
  paragraphs = [],
  subtitle,
  media,
}) {
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:items-center gap-8 @lg:justify-between w-full">
      {/* Text column */}
      <div className="flex flex-col items-start gap-4 flex-1 w-full">
        <h2 className="tracking-tight font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-primary)] text-fluid-subheading">
          {title}
        </h2>
        <div className="flex flex-col items-start gap-2 w-full">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-primary)] text-body leading-[1.25rem]"
            >
              {paragraph}
            </p>
          ))}
          {subtitle && (
            <p className="tracking-tight font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Image column */}
      <figure className="flex flex-col items-start gap-3 flex-1 w-full @lg:w-auto @lg:max-w-md m-0">
        <CaseStudyMedia
          media={media}
          sizes="(max-width: 640px) 92vw, 448px"
          maxWidth={900}
          fillClassName="w-full rounded-[20px] object-cover"
        />
        {media?.caption && (
          <figcaption className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-caption">
            {media.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}
