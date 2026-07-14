import ProjectDetails from './blocks/ProjectDetails'
import Hero from './blocks/Hero'
import TextImageRow from './blocks/TextImageRow'
import ImageRow from './blocks/ImageRow'
import ImageTextGrid from './blocks/ImageTextGrid'
import CallToAction from './blocks/CallToAction'
import TextBlockCentered from './blocks/TextBlockCentered'
import TextCardRow from './blocks/TextCardRow'
import TextColumns from './blocks/TextColumns'
import TextRowTwoColumn from './blocks/TextRowTwoColumn'
import ImageFull from './blocks/ImageFull'

// Block registry - add new block types here
const blockRegistry = {
  projectDetails: ProjectDetails,
  hero: Hero,
  textImageRow: TextImageRow,
  imageRow: ImageRow,
  imageTextGrid: ImageTextGrid,
  callToAction: CallToAction,
  textBlockCentered: TextBlockCentered,
  textCardRow: TextCardRow,
  textColumns: TextColumns,
  textRowTwoColumn: TextRowTwoColumn,
  imageFull: ImageFull,
}

export default function BlockRenderer({ blocks }) {
  if (!blocks || !Array.isArray(blocks)) {
    return null
  }

  return (
    <div className="flex flex-col gap-16">
      {blocks.map((block, index) => {
        const Component = blockRegistry[block._type]

        // Skip silently if block type has no registered component
        if (!Component) {
          return null
        }

        return <Component key={block._key || index} block={block} />
      })}
    </div>
  )
}
