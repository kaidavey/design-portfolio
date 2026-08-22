import CaseStudyFrame from '../../CaseStudyFrame'
import CaseStudyImage from '../../CaseStudyImage'

/**
 * FramedImagePresentation - Pure presentation component
 *
 * One image centred on a surface. The surface fills the container width and
 * keeps the shape the editor picked, so it is what stretches and shrinks as
 * the shell moves between compact and expanded. The image inside keeps its own
 * proportions and is scaled down only far enough to fit.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function FramedImagePresentation({ imageSource, imageAlt, caption, frame }) {
  return (
    <figure className="flex flex-col items-start gap-3 w-full m-0">
      <CaseStudyFrame frame={frame}>
        <CaseStudyImage
          source={imageSource}
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
