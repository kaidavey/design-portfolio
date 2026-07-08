import { urlFor } from '../../lib/sanity'
import TextImageRowPresentation from './presentations/TextImageRowPresentation'

/**
 * TextImageRow - Block wrapper
 *
 * Maps Sanity block data → presentation component props
 * This is the only file that needs updating when Sanity fields change
 */
export default function TextImageRow({ block }) {
  return (
    <TextImageRowPresentation
      title={block.title}
      paragraphs={block.paragraphs || []}
      subtitle={block.subtitle}
      imageUrl={urlFor(block.image).width(800).url()}
      imageAlt={block.title}
    />
  )
}
