import CaseStudyImage from '../../CaseStudyImage'

/**
 * ImageFullPresentation - Pure presentation component
 *
 * One image, the full width of the container. The height is whatever the
 * image's own proportions make it — nothing is cropped and no ratio is
 * imposed. The query hands the image's dimensions down with it, so that height
 * is reserved before the bytes land rather than after.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function ImageFullPresentation({ imageSource, imageAlt, caption }) {
  return (
    <figure className="flex flex-col items-start gap-3 w-full m-0">
      <div className="w-full overflow-hidden rounded-[20px]">
        <CaseStudyImage
          source={imageSource}
          alt={imageAlt}
          sizes="(max-width: 1040px) 92vw, 907px"
          maxWidth={1800}
          className="block w-full h-auto [box-shadow:rgba(0,0,0,0.05)_0px_0px_10px_2px_inset]"
        />
      </div>

      {caption && (
        <figcaption className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
