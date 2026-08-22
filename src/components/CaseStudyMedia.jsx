import CaseStudyImage from './CaseStudyImage'
import CaseStudyFrame from './CaseStudyFrame'

/**
 * CaseStudyMedia - Renders one `caseStudyImage` value.
 *
 * This is the single place that decides plain vs framed, which is what lets a
 * framed device shot go anywhere a plain image goes: a column of an image row,
 * a cell of an image + text grid, the image half of a text + image row, or on
 * its own as a block.
 *
 * Plain: the image fills its slot, cropped by `fillClassName` if the slot has a
 * shape of its own.
 * Framed: the frame fills the slot and the image sits uncropped in the middle
 * of it.
 *
 * @param {object} media - A `caseStudyImage` value: { image, alt, framed, frame }
 * @param {string} sizes - Sizes attribute describing the rendered width
 * @param {number} maxWidth - Largest srcset candidate to generate
 * @param {string} fillClassName - Classes for the unframed image
 * @param {string} frameClassName - Classes for the frame element
 * @param {string} loading - 'lazy' (default) or 'eager'
 */
export default function CaseStudyMedia({
  media,
  sizes,
  maxWidth,
  fillClassName = '',
  frameClassName = '',
  loading = 'lazy',
}) {
  if (!media?.image?.asset) return null

  const alt = media.alt || ''

  if (!media.framed) {
    return (
      <CaseStudyImage
        source={media.image}
        alt={alt}
        sizes={sizes}
        maxWidth={maxWidth}
        className={fillClassName}
        loading={loading}
      />
    )
  }

  return (
    <CaseStudyFrame frame={media.frame} className={frameClassName}>
      {/* max-w/max-h cap the image at the frame's inner box; object-contain
          keeps its proportions on the way down. Nothing here crops. */}
      <CaseStudyImage
        source={media.image}
        alt={alt}
        sizes={sizes}
        maxWidth={maxWidth}
        className="max-w-full max-h-full w-auto h-auto object-contain"
        loading={loading}
      />
    </CaseStudyFrame>
  )
}
