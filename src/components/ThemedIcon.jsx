import { urlFor, isSvgAsset } from '../lib/sanity'
import { warmImage } from '../lib/warmImage'
import { useThemedImage } from '../hooks/useThemedImage'

/**
 * ThemedIcon - the small square marks blocks carry, resolved for the theme.
 *
 * Hero and Text Card Row both hold decorative icons rather than content images:
 * fixed-size, square-cropped, no caption, no srcset worth the bytes. They are
 * also the images most likely to be a black mono SVG, so they are exactly what
 * dark mode loses. This gives them the same three-way choice a content image
 * has — same file, inverted, or a separate dark upload — without dragging in
 * the responsive machinery of `CaseStudyImage`.
 *
 * Square-crops through the Sanity pipeline, except for SVG, which Sanity hands
 * back untouched whatever you ask of it.
 *
 * @param {object} source - The light mode icon
 * @param {object} darkSource - The dark mode icon, when darkMode is 'upload'
 * @param {string} darkMode - 'same' | 'invert' | 'upload'
 * @param {number} size - Rendered edge in CSS pixels; also the requested crop
 * @param {string} className - Classes describing the box the icon sits in
 */
export default function ThemedIcon({ source, darkSource, darkMode, size, className = '' }) {
  const { source: themed, alternate, invertClassName } = useThemedImage(source, {
    darkSource,
    darkMode,
  })

  if (!themed?.asset) return null

  const iconSrc = (value) =>
    isSvgAsset(value) ? urlFor(value).url() : urlFor(value).width(size).height(size).url()

  function handleLoad() {
    if (!alternate) return
    warmImage({ src: iconSrc(alternate) })
  }

  return (
    <img
      src={iconSrc(themed)}
      alt=""
      decoding="async"
      onLoad={handleLoad}
      className={`${className} ${invertClassName}`.trim()}
    />
  )
}
