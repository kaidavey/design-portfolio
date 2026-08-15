import { urlFor } from '../../lib/sanity'

/**
 * CaseStudyImage - Responsive image component with srcset
 *
 * Centralizes responsive image delivery for case study content blocks.
 * Automatically generates srcset candidates and preserves aspect ratio
 * to prevent CLS.
 *
 * @param {object} source - Sanity image asset object
 * @param {string} alt - Alt text for accessibility
 * @param {string} sizes - Sizes attribute (per-block, describes rendered width)
 * @param {number[]} widths - Array of srcset candidate widths (default based on maxWidth)
 * @param {number} maxWidth - Maximum image width for srcset generation (required)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 */
export default function CaseStudyImage({
  source,
  alt,
  sizes,
  widths,
  maxWidth,
  className = '',
  style = {},
}) {
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

  // Extract aspect ratio from Sanity metadata if available
  let aspectRatio = null
  if (source?.asset?.metadata?.dimensions) {
    const { width, height } = source.asset.metadata.dimensions
    aspectRatio = width / height
  }

  return (
    <img
      src={src}
      srcSet={srcset}
      sizes={sizes}
      alt={alt}
      className={className}
      style={{
        ...style,
        ...(aspectRatio && { aspectRatio: aspectRatio.toString() }),
      }}
    />
  )
}
