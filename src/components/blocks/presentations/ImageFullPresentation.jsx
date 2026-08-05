import CaseStudyImage from '../../CaseStudyImage'

/**
 * ImageFullPresentation - Pure presentation component
 *
 * Full-width standalone image block with optional caption.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function ImageFullPresentation({ imageSource, imageAlt, caption }) {
  return (
    <div className="flex flex-col items-start gap-3 w-full">
      {/* Image */}
      <div className="w-full overflow-hidden rounded-xl">
        <CaseStudyImage
          source={imageSource}
          alt={imageAlt}
          sizes="(max-width: 1040px) 92vw, 907px"
          maxWidth={1800}
          className="w-full object-cover [box-shadow:rgba(0,0,0,0.05)_0px_0px_10px_2px_inset]"
        />
      </div>

      {/* Optional Caption */}
      {caption && (
        <p className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-caption">
          {caption}
        </p>
      )}
    </div>
  )
}
