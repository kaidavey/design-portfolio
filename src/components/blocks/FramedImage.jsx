import FramedImagePresentation from './presentations/FramedImagePresentation'

/**
 * FramedImage - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function FramedImage({ block }) {
  return (
    <FramedImagePresentation
      imageSource={block.image}
      imageDarkSource={block.imageDark}
      imageInvert={block.imageDarkInvert}
      imageAlt={block.alt || ''}
      caption={block.caption}
      height={block.height}
      frame={block.frame}
    />
  )
}
