import { useLayoutEffect, useRef, useState } from 'react'
import { useSuppressBlockEntrance, useInstantBlockEntrance } from '../context/BlockEntranceContext'
import { useMorphCutIndex } from '../context/MorphCutContext'
import { useScrollRoot, scrollViewportBounds } from '../context/ScrollContainerContext'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'
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
import FramedImage from './blocks/FramedImage'
import Spacer from './blocks/Spacer'

function AnimatedBlock({ children, index, isFirst = false }) {
  const suppress = useSuppressBlockEntrance()
  const instant = useInstantBlockEntrance()
  const cutIndex = useMorphCutIndex()
  const scrollRootRef = useScrollRoot()
  const nodeRef = useRef(null)
  const { ref: observerRef, isVisible } = useScrollAnimation(scrollRootRef)
  const [hasBeenUnsuppressed, setHasBeenUnsuppressed] = useState(!suppress)

  // Captured once at mount — later context changes must not retroactively
  // re-animate a block the user is already looking at.
  //
  // 'instant'  render at final state, no entrance (on-screen at mount, or instant flag set)
  // 'immediate' animate in right away (existing isFirst behaviour)
  // 'scroll'   wait for the intersection observer
  // 'suppressed' waiting for suppress to become false
  const [mode, setMode] = useState(() => {
    if (suppress) return 'suppressed'
    if (instant) return 'instant'
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
        const rect = nodeRef.current.getBoundingClientRect()
        const elementMiddle = rect.top + rect.height / 2
        const bounds = scrollViewportBounds(scrollRootRef)
        // Only animate immediately if element is 50% visible (middle point is on screen)
        setMode(elementMiddle < bounds.bottom && elementMiddle > bounds.top ? 'immediate' : 'scroll')
      } else {
        setMode('scroll')
      }
    }
  }, [suppress, hasBeenUnsuppressed, mode, isFirst, scrollRootRef])

  // Blocks default to 'instant' so nothing on screen ever flashes at opacity 0.
  // Anything that measures out below the fold gets handed back to the observer.
  // This runs before paint, and those blocks are off-screen anyway, so the
  // correction is invisible.
  //
  // This predicate defines which blocks a column paints, so useExpandMorph's
  // cut measurement mirrors it exactly. If the two drift apart, the compact and
  // expanded columns stop agreeing and content flickers at the handoff.
  useLayoutEffect(() => {
    if (mode !== 'instant' || !nodeRef.current) return
    const { top } = nodeRef.current.getBoundingClientRect()
    if (top >= scrollViewportBounds(scrollRootRef).bottom) setMode('scroll')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // For blocks that start in 'scroll' mode, check if they're already on screen
  // and switch to 'immediate' mode to avoid the upward movement (blur only)
  useLayoutEffect(() => {
    if (mode !== 'scroll' || !nodeRef.current) return
    const rect = nodeRef.current.getBoundingClientRect()
    const elementMiddle = rect.top + rect.height / 2
    const bounds = scrollViewportBounds(scrollRootRef)
    // If element is already 50% visible, use immediate mode (blur only, no y movement)
    if (elementMiddle < bounds.bottom && elementMiddle > bounds.top) {
      setMode('immediate')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setRefs(node) {
    nodeRef.current = node
    if (observerRef) observerRef.current = node
  }

  // A cut index only exists while an expand morph is in flight, and it splits
  // this column in two: blocks past it are hidden, blocks up to it are pinned
  // at their final state.
  const morphing = cutIndex != null && index != null

  // Cut blocks are always a contiguous suffix — a flex column stacks
  // vertically, so visibility is monotonic in index — which is what makes
  // display:none safe here: dropping them cannot shift anything retained. It
  // also takes them out of the per-frame layout while the column's width
  // animates, which is worth real time on a long case study.
  const isCut = morphing && index > cutIndex

  // The data attribute is the contract useExpandMorph measures against. Every
  // branch carries it, cut or not.
  const wrapperProps = {
    ref: setRefs,
    'data-block-index': index,
    ...(isCut ? { style: { display: 'none' } } : null),
  }

  // Retained blocks skip whatever entrance they were mid-way through and pin to
  // their final state, so this column paints exactly what the expanded column
  // paints and the handoff has nothing to reconcile. A retained block the user
  // never scrolled to is still at opacity 0 at this point; snapping it visible
  // is invisible because it sits below the box's fold, where the container's
  // clip still covers it. The clip then unveils it over the grow instead of
  // popping it in.
  if (morphing && !isCut) {
    return (
      <motion.div {...wrapperProps} initial={false} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0 }}>
        {children}
      </motion.div>
    )
  }

  if (mode === 'suppressed') {
    return (
      <motion.div {...wrapperProps} initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 0, filter: 'blur(8px)' }}>
        {children}
      </motion.div>
    )
  }

  if (mode === 'instant') {
    return (
      <motion.div {...wrapperProps} initial={false} animate={{ opacity: 1, filter: 'blur(0px)' }}>
        {children}
      </motion.div>
    )
  }

  if (mode === 'immediate') {
    return (
      <motion.div
        {...wrapperProps}
        initial={{ opacity: 0, filter: 'blur(8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      {...wrapperProps}
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={isVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(8px)' }}
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
  framedImage: FramedImage,
  spacer: Spacer,
}

/**
 * Number every block that gets an AnimatedBlock wrapper, in document order.
 *
 * `data-block-index` is what useExpandMorph measures against, and both halves
 * of that mechanism assume one thing: the sequence only ever increases down the
 * page. measureVisibleCut walks the wrappers flat and stops at the first one
 * past the fold; AnimatedBlock then hides every block whose index is past the
 * cut, which is only safe while "past the cut" and "further down" mean the same
 * thing.
 *
 * So a group contributes its children to the sequence and never itself. A group
 * is a flex column inside a flex column, so its children still run top to
 * bottom in document order and the invariant survives the nesting. Blocks that
 * get no wrapper — spacers, groups, unknown types — claim no index; gaps in the
 * numbering are fine, only the ordering matters.
 *
 * Indices are keyed by block identity rather than position, so the caller can
 * look one up without re-deriving the walk.
 */
function assignBlockIndices(blocks, indices = new Map(), counter = { next: 0 }) {
  for (const block of blocks || []) {
    if (!block) continue

    if (block._type === 'blockGroup') {
      assignBlockIndices(block.blocks, indices, counter)
      continue
    }

    if (block._type === 'spacer' || !blockRegistry[block._type]) continue

    indices.set(block, counter.next++)
  }

  return indices
}

function renderBlock(block, fallbackKey, indices, expandButton) {
  const key = block._key || fallbackKey

  // A group paints no content of its own — it is the column its children sit
  // in, holding the gap they share.
  if (block._type === 'blockGroup') {
    return (
      <div
        key={key}
        className="flex flex-col w-full"
        style={{ gap: `${block.gap ?? CASE_STUDY_LAYOUT.blockGap}px` }}
      >
        {(block.blocks || []).map((child, childIndex) =>
          renderBlock(child, `${key}-${childIndex}`, indices, expandButton)
        )}
      </div>
    )
  }

  const Component = blockRegistry[block._type]
  if (!Component) return null

  if (block._type === 'spacer') {
    return <Component key={key} block={block} />
  }

  const index = indices.get(block)

  // The expand button rides on the very first block that paints, wherever it
  // sits — inside a group as readily as at the top level.
  if (index === 0 && expandButton) {
    return (
      <AnimatedBlock key={key} index={index} isFirst={true}>
        <div className="flex items-center justify-between w-full">
          <Component block={block} />
          <div className="shrink-0 pb-4">{expandButton}</div>
        </div>
      </AnimatedBlock>
    )
  }

  return (
    <AnimatedBlock key={key} index={index} isFirst={index === 0}>
      <Component block={block} />
    </AnimatedBlock>
  )
}

export default function BlockRenderer({ blocks, expandButton }) {
  if (!blocks || !Array.isArray(blocks)) {
    return null
  }

  const indices = assignBlockIndices(blocks)

  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, index) => renderBlock(block, index, indices, expandButton))}
    </div>
  )
}
