import { useLayoutEffect, useRef, useState } from 'react'
  import { useSuppressBlockEntrance } from '../context/BlockEntranceContext'
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
  const suppress = useSuppressBlockEntrance()
  const nodeRef = useRef(null)
  const { ref: observerRef, isVisible } = useScrollAnimation()
  const [hasBeenUnsuppressed, setHasBeenUnsuppressed] = useState(!suppress)

  // Captured once at mount — later context changes must not retroactively
  // re-animate a block the user is already looking at.
  //
  // 'instant'  render at final state, no entrance (on-screen at mount)
  // 'immediate' animate in right away (existing isFirst behaviour)
  // 'scroll'   wait for the intersection observer
  // 'suppressed' waiting for suppress to become false
  const [mode, setMode] = useState(() => {
    if (suppress) return 'suppressed'
    return isFirst ? 'immediate' : 'scroll'
  })

  // When suppress changes from true to false, trigger animations
  useLayoutEffect(() => {
    if (!suppress && !hasBeenUnsuppressed && mode === 'suppressed') {
      setHasBeenUnsuppressed(true)
      // Check if element is in viewport
      if (isFirst) {
        setMode('immediate')
      } else if (nodeRef.current) {
        const { top } = nodeRef.current.getBoundingClientRect()
        // If on-screen, animate immediately; otherwise wait for scroll
        setMode(top < window.innerHeight ? 'immediate' : 'scroll')
      } else {
        setMode('scroll')
      }
    }
  }, [suppress, hasBeenUnsuppressed, mode, isFirst])

  // Blocks default to 'instant' so nothing on screen ever flashes at opacity 0.
  // Anything that measures out below the fold gets handed back to the observer.
  // This runs before paint, and those blocks are off-screen anyway, so the
  // correction is invisible.
  useLayoutEffect(() => {
    if (mode !== 'instant' || !nodeRef.current) return
    const { top } = nodeRef.current.getBoundingClientRect()
    if (top >= window.innerHeight) setMode('scroll')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setRefs(node) {
    nodeRef.current = node
    if (observerRef) observerRef.current = node
  }

  if (mode === 'suppressed') {
    return (
      <motion.div ref={setRefs} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0, y: 20 }}>
        {children}
      </motion.div>
    )
  }

  if (mode === 'instant') {
    return (
      <motion.div ref={setRefs} initial={false} animate={{ opacity: 1, y: 0 }}>
        {children}
      </motion.div>
    )
  }

  if (mode === 'immediate') {
    return (
      <motion.div
        ref={setRefs}
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
      ref={setRefs}
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
