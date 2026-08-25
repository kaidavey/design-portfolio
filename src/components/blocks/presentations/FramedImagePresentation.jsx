import CaseStudyFrame from '../../CaseStudyFrame'
import CaseStudyImage from '../../CaseStudyImage'

/**
 * FramedImagePresentation - Pure presentation component
 *
 * One image centred on a surface. The surface stands exactly as tall as the
 * editor asked and fills the width it is given, so it is the part that responds
 * when the shell moves between compact and expanded. The image inside holds its
 * own proportions and is scaled down only far enough to fit — never cropped.
 *
 * The surface wears `BLOCK_SURFACE`, the same skin as every other surfaced
 * block, so a framed image reads as one of the family.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function FramedImagePresentation({
  imageSource,
  imageDarkSource,
  imageInvert,
  imageAlt,
  caption,
  frame,
  height,
}) {
  return (
    <figure className="flex flex-col items-start gap-[22px] w-full m-0">
      <CaseStudyFrame frame={frame} height={height}>
        <CaseStudyImage
          source={imageSource}
          darkSource={imageDarkSource}
          invert={imageInvert}
          alt={imageAlt}
          sizes="(max-width: 1040px) 92vw, 907px"
          maxWidth={1600}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      </CaseStudyFrame>

      {caption && (
        <figcaption className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
