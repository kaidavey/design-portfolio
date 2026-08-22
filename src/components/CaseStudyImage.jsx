import { urlFor } from '../lib/sanity'

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
 * @param {object} source - Sanity image asset object
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
  alt = '',
  sizes,
  widths,
  maxWidth,
  className = '',
  style = {},
  loading = 'lazy',
}) {
  // An image field can be empty while a study is still being written, and a
  // half-filled block must not take the whole page down with it.
  if (!source?.asset) return null

  // Generate default widths if not provided: [0.5×, 0.75×, 1×, 1.5×, 2×] of maxWidth
  const defaultWidths = [
    Math.round(maxWidth * 0.5),
    Math.round(maxWidth * 0.75),
    maxWidth,
    Math.round(maxWidth * 1.5),
    Math.round(maxWidth * 2),
  ]
  const candidateWidths = widths || defaultWidths

  // Build srcset string
  const srcset = candidateWidths
    .map((w) => `${urlFor(source).width(w).url()} ${w}w`)
    .join(', ')

  // Get base URL for src fallback (use maxWidth)
  const src = urlFor(source).width(maxWidth).url()

  // Extract intrinsic dimensions from Sanity metadata if available
  const dimensions = source.asset?.metadata?.dimensions
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : null

  return (
    <img
      src={src}
      srcSet={srcset}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      style={{
        ...style,
        ...(aspectRatio && { aspectRatio: aspectRatio.toString() }),
      }}
    />
  )
}
