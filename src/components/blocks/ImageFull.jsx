import { urlFor } from '../../lib/sanity'
import ImageFullPresentation from './presentations/ImageFullPresentation'

/**
 * ImageFull - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function ImageFull({ block }) {
  return (
    <ImageFullPresentation
      imageUrl={urlFor(block.image).width(1600).url()}
      imageAlt={block.caption || 'Case study image'}
      caption={block.caption}
    />
  )
}
