import { urlFor, isSvgAsset } from '../lib/sanity'
import { useThemedImage, warmImage } from '../hooks/useThemedImage'

/** Sanity does not rasterise SVG, so a candidate list would be five names for one file. */
function sourcesFor(image, widths, maxWidth) {
  if (isSvgAsset(image)) return { src: urlFor(image).url() }

  return {
    src: urlFor(image).width(maxWidth).url(),
    srcSet: widths.map((w) => `${urlFor(image).width(w).url()} ${w}w`).join(', '),
  }
}

/**
 * CaseStudyImage - Responsive image component with srcset
 *
 * Centralizes responsive image delivery for case study content blocks.
 * Automatically generates srcset candidates and preserves aspect ratio
 * to prevent CLS.
 *
 * The aspect ratio comes from `asset->metadata.dimensions`, which the case
 * study query dereferences for every image. Without it the browser learns the
 * shape only once the bytes land, and every image below the fold jumps.
 *
 * `darkSource` and `invert` are the optional dark mode handling — see
 * `useThemedImage`. Neither involves a reload: the swap is a re-render on this
 * same element, or, for inverted art, pure CSS.
 *
 * @param {object} source - Sanity image asset object
 * @param {object} darkSource - Optional image to show instead in dark mode
 * @param {boolean} invert - Optional: flip this image in dark mode via CSS
 * @param {string} alt - Alt text for accessibility ('' marks it decorative)
 * @param {string} sizes - Sizes attribute (per-block, describes rendered width)
 * @param {number[]} widths - Array of srcset candidate widths (default based on maxWidth)
 * @param {number} maxWidth - Maximum image width for srcset generation (required)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {string} loading - 'lazy' (default) or 'eager' for above-the-fold art
 */
export default function CaseStudyImage({
  source,
  darkSource,
  invert,
  alt = '',
  sizes,
  widths,
  maxWidth,
  className = '',
  style = {},
  loading = 'lazy',
}) {
  const { source: shown, alternate, invertClass } = useThemedImage(source, { darkSource, invert })

  // An image field can be empty while a study is still being written, and a
  // half-filled block must not take the whole page down with it.
  if (!shown?.asset) return null

  const candidates = widths || [0.5, 0.75, 1, 1.5, 2].map((f) => Math.round(maxWidth * f))
  const { src, srcSet } = sourcesFor(shown, candidates, maxWidth)

  // Extract intrinsic dimensions from Sanity metadata if available
  const dimensions = shown.asset?.metadata?.dimensions
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : null

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      // Only after this one has painted, so the twin never competes with it.
      onLoad={alternate && (() => warmImage({ ...sourcesFor(alternate, candidates, maxWidth), sizes }))}
      className={`${className} ${invertClass}`.trim()}
      style={{
        ...style,
        ...(aspectRatio && { aspectRatio: aspectRatio.toString() }),
      }}
    />
  )
}
