import { urlFor, isSvgAsset } from '../lib/sanity'
import { warmImage } from '../lib/warmImage'
import { useThemedImage } from '../hooks/useThemedImage'

/**
 * The URLs one source resolves to at one set of candidate widths.
 *
 * SVG is the exception: Sanity does not rasterise it, so every `?w=` candidate
 * would be the same file under a different URL. One plain `src` instead.
 */
function resolveSources(source, candidateWidths, maxWidth) {
  if (!source?.asset) return { src: null, srcSet: undefined }

  if (isSvgAsset(source)) {
    return { src: urlFor(source).url(), srcSet: undefined }
  }

  return {
    src: urlFor(source).width(maxWidth).url(),
    srcSet: candidateWidths.map((w) => `${urlFor(source).width(w).url()} ${w}w`).join(', '),
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
 * Also the single place a case study image resolves its dark mode form. The
 * editor's choice arrives as `darkMode` and is interpreted by `useThemedImage`;
 * all this component does with the answer is render the source it is handed,
 * carry the invert class if there is one, and — once the visible variant has
 * loaded — warm the twin so the first theme toggle is a repaint rather than a
 * fetch. Nothing here waits on a reload: the swap is a React re-render driven by
 * the theme context, or, for inverted art, pure CSS.
 *
 * @param {object} source - Sanity image asset object (the light mode image)
 * @param {object} darkSource - Optional dark mode image, used when darkMode is 'upload'
 * @param {string} darkMode - 'same' | 'invert' | 'upload' (defaults to same)
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
  darkMode,
  alt = '',
  sizes,
  widths,
  maxWidth,
  className = '',
  style = {},
  loading = 'lazy',
}) {
  const { source: themed, alternate, invertClassName } = useThemedImage(source, {
    darkSource,
    darkMode,
  })

  // An image field can be empty while a study is still being written, and a
  // half-filled block must not take the whole page down with it.
  if (!themed?.asset) return null

  // Generate default widths if not provided: [0.5×, 0.75×, 1×, 1.5×, 2×] of maxWidth
  const defaultWidths = [
    Math.round(maxWidth * 0.5),
    Math.round(maxWidth * 0.75),
    maxWidth,
    Math.round(maxWidth * 1.5),
    Math.round(maxWidth * 2),
  ]
  const candidateWidths = widths || defaultWidths

  const { src, srcSet } = resolveSources(themed, candidateWidths, maxWidth)

  // Extract intrinsic dimensions from Sanity metadata if available
  const dimensions = themed.asset?.metadata?.dimensions
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : null

  // The twin is fetched only after this one has painted, so it never competes
  // with the image the reader is waiting on.
  function handleLoad() {
    if (!alternate) return
    warmImage({ ...resolveSources(alternate, candidateWidths, maxWidth), sizes })
  }

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={handleLoad}
      className={`${className} ${invertClassName}`.trim()}
      style={{
        ...style,
        ...(aspectRatio && { aspectRatio: aspectRatio.toString() }),
      }}
    />
  )
}
