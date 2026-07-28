import { motion } from 'framer-motion'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
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
import Spacer from './blocks/Spacer'

function AnimatedBlock({ children, isFirst = false }) {
  const { ref, isVisible } = useScrollAnimation()

  if (isFirst) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

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
  spacer: Spacer,
}

export default function BlockRenderer({ blocks, expandButton }) {
  if (!blocks || !Array.isArray(blocks)) {
    return null
  }

  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, index) => {
        const Component = blockRegistry[block._type]

        if (!Component) {
          return null
        }

        if (block._type === 'spacer') {
          return <Component key={block._key || index} block={block} />
        }

        if (index === 0 && expandButton) {
          return (
            <AnimatedBlock key={block._key || index} isFirst={true}>
              <div className="flex items-center justify-between w-full">
                <Component block={block} />
                <div className="shrink-0 pb-4">{expandButton}</div>
              </div>
            </AnimatedBlock>
          )
        }

        return (
          <AnimatedBlock key={block._key || index} isFirst={index === 0}>
            <Component block={block} />
          </AnimatedBlock>
        )
      })}
    </div>
  )
}
