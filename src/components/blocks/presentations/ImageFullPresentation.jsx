import CaseStudyImage from '../../CaseStudyImage'
import { imageHeightStyle } from '../../../config/imageFrame'

/**
 * ImageFullPresentation - Pure presentation component
 *
 * One image, the full width of the container, standing exactly as tall as the
 * editor asked. The height is the fixed part — it does not move when the window
 * does — so the image fills that box and is cropped to it. Its hotspot decides
 * what survives the crop.
 *
 * With no height it falls back to the image's own proportions, and the query's
 * dimensions reserve that height before the bytes land.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function ImageFullPresentation({
  imageSource,
  imageDarkSource,
  imageInvert,
  imageAlt,
  caption,
  height,
}) {
  const box = imageHeightStyle(height)

  return (
    <figure className="flex flex-col items-start gap-3 w-full m-0">
      <div className="w-full overflow-clip rounded-[20px]" style={box ?? undefined}>
        <CaseStudyImage
          source={imageSource}
          darkSource={imageDarkSource}
          invert={imageInvert}
          alt={imageAlt}
          sizes="(max-width: 1040px) 92vw, 907px"
          maxWidth={1800}
          className={`${box ? 'block w-full h-full object-cover' : 'block w-full h-auto'} [box-shadow:rgba(0,0,0,0.05)_0px_0px_10px_2px_inset]`}
          style={box ? { height: '100%' } : undefined}
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
