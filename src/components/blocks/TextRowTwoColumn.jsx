import TextRowTwoColumnPresentation from './presentations/TextRowTwoColumnPresentation'

/**
 * TextRowTwoColumn - Block wrapper
 * Maps Sanity block → presentation props
 */
export default function TextRowTwoColumn({ block }) {
  return (
    <TextRowTwoColumnPresentation
      section={block.section}
      title={block.title}
      leftParagraphs={block.leftParagraphs || []}
      rightParagraphs={block.rightParagraphs || []}
    />
  )
}
