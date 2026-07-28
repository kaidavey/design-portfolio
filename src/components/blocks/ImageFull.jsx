import ImageFullPresentation from './presentations/ImageFullPresentation'

/**
 * ImageFull - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function ImageFull({ block }) {
  return (
    <ImageFullPresentation
      imageSource={block.image}
      imageAlt={block.caption || 'Case study image'}
      caption={block.caption}
    />
  )
}
