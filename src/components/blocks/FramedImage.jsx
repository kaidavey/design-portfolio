import FramedImagePresentation from './presentations/FramedImagePresentation'

/**
 * FramedImage - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function FramedImage({ block }) {
  return (
    <FramedImagePresentation
      imageSource={block.image}
      imageAlt={block.alt || ''}
      caption={block.caption}
      frame={block.frame}
    />
  )
}
