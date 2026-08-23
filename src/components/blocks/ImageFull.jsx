import ImageFullPresentation from './presentations/ImageFullPresentation'

/**
 * ImageFull - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function ImageFull({ block }) {
  return (
    <ImageFullPresentation
      imageSource={block.image}
      imageDarkSource={block.imageDark}
      imageInvert={block.imageDarkInvert}
      imageAlt={block.alt || ''}
      caption={block.caption}
    />
  )
}
