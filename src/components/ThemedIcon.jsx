import { urlFor, isSvgAsset } from '../lib/sanity'
import { useThemedImage, warmImage } from '../hooks/useThemedImage'

/**
 * The decorative marks Hero and Text Card Row carry: fixed size, square-cropped,
 * no srcset worth the bytes. Same optional dark handling as a content image —
 * these are the ones most likely to be a black mono SVG, which is exactly what
 * dark mode loses.
 */
export default function ThemedIcon({ source, darkSource, invert, size, className = '' }) {
  const { source: shown, alternate, invertClass } = useThemedImage(source, { darkSource, invert })

  if (!shown?.asset) return null

  // Sanity hands SVG back untouched whatever crop is asked of it.
  const url = (i) => (isSvgAsset(i) ? urlFor(i).url() : urlFor(i).width(size).height(size).url())

  return (
    <img
      src={url(shown)}
      alt=""
      decoding="async"
      onLoad={alternate && (() => warmImage({ src: url(alternate) }))}
      className={`${className} ${invertClass}`.trim()}
    />
  )
}
