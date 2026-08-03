import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '../lib/sanity'

const builder = imageUrlBuilder(client)
 
// Single source of truth for cover resolution — the morph proxies in
// CaseStudy.jsx import this so proxy and peek always show the identical
// URL (no flash-of-different-crop at the handoff frames).
export function getCoverUrl(study) {
  // ⚠️ ADJUST: match your schema's cover field name. Also confirm your
  // getAllCaseStudies GROQ projection includes this field — the list
  // query, not just the detail query, must return it.
  const source = study?.coverImage ?? study?.cover ?? study?.thumbnail ?? null
  if (!source) return null
  return builder.image(source).width(1400).auto('format').url()
}
 
// Resolve a config length ('4vw' / '40px' / number) to px for slide offsets.
function resolveToPx(value, fallback = 80) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return fallback
  const n = parseFloat(value)
  if (Number.isNaN(n)) return fallback
  if (value.endsWith('vw')) return (n / 100) * window.innerWidth
  if (value.endsWith('vh')) return (n / 100) * window.innerHeight
  return n
}
 
// Card variants are functions of `custom` (not closed-over props) because
// the exiting card is rendered from AnimatePresence's memory — only the
// `custom` prop on AnimatePresence reaches it. Closing over `role` would
// make exits use the previous render's (null) role and slide when they
// should hide.
const cardVariants = {
  initial: (c) =>
    c.role === 'shrink-dest'
      ? { x: 0, opacity: 0 } // placed by the shrinking proxy, revealed on arrival
      : { x: c.edgeSign * c.slideDistance, opacity: 0 },
  animate: (c) =>
    c.role === 'shrink-dest'
      ? {
          x: 0,
          opacity: 1,
          transition: { delay: c.nm.growDuration, duration: 0.15, ease: 'linear' },
        }
      : {
          x: 0,
          opacity: 1,
          transition: {
            ...c.nm.peekSpring,
            delay: 0.4 // Wait for exiting card to slide out
          }
        },
  exit: (c) =>
    c.role === 'grow-origin'
      ? { opacity: 0, transition: { duration: 0 } } // the growing proxy replaces it this frame
      : { x: c.edgeSign * c.slideDistance, opacity: 0, transition: c.nm.peekSpring },
}
 
const CaseStudyPeek = forwardRef(function CaseStudyPeek(
  { side, study, config, isAnimating, navMorph, onClick },
  cardRef
) {
  const peek = config.peek
  const nm = config.navMorph
 
  // Which part this slot plays in an active nav morph:
  //   dir > 0 (next-click): prev slot receives the shrinking proxy,
  //                         next slot is where the growing proxy departs.
  //   dir < 0: mirror.
  const role = navMorph
    ? (navMorph.dir > 0) === (side === 'prev')
      ? 'shrink-dest'
      : 'grow-origin'
    : null
 
  const edgeSign = side === 'prev' ? -1 : 1
  const slideDistance = resolveToPx(peek.revealWidth) * 2
  const cardCustom = { role, edgeSign, slideDistance, nm }
  const coverUrl = getCoverUrl(study)
  const slugKey = study?.slug?.current ?? 'empty'
  const interactive = Boolean(study) && !navMorph && !isAnimating
 
  // ATTACH-ONLY REF — the fix for the morph dying after the first
  // navigation. AnimatePresence keeps the exiting card mounted after the
  // incoming card has already attached to this same ref. When the old
  // card's exit finishes and it unmounts, React runs its ref cleanup
  // LAST — which, with a plain ref, nulls out the node the NEW card just
  // registered. Every subsequent beginNavMorph then measures null and
  // silently falls back to the slide. So: set on attach, never clear on
  // detach. A stale node measures zero-width and is rejected by rectOf
  // upstream, so there is no unsafe path.
  const attachCardRef = (node) => {
    if (node && cardRef) cardRef.current = node
  }
 
  // The slot itself. Always rendered at identical width on both sides —
  // the container centers via justify-between, and the fixed blur/border
  // overlays center independently; asymmetric slots would desync them.
  return (
    <motion.div
      style={{
        position: 'relative',
        width: peek.revealWidth,
        height: peek.height,
        maxHeight: peek.maxHeight,
        overflow: 'hidden',
        flexShrink: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        cursor: interactive ? 'pointer' : 'default',
      }}
      // Expand handoff: slide away and fade. Not the skin treatment — peeks do
      // not scale to 1.02 and take no part in the expand morph.
      animate={{
        x: isAnimating ? (side === 'prev' ? -200 : 200) : 0,
        opacity: isAnimating ? 0 : 1,
      }}
      transition={{ duration: peek.fadeOutDuration, ease: nm.ease }}
      onClick={interactive ? onClick : undefined}
      role={study ? 'button' : undefined}
      aria-label={study ? `View ${study.title}` : undefined}
      tabIndex={-1}
    >
      <AnimatePresence initial={false} custom={cardCustom}>
        {study && (
          <motion.div
            key={slugKey}
            ref={attachCardRef}
            custom={cardCustom}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              [side === 'prev' ? 'right' : 'left']: 0,
              width: config.containerWidth,
              maxWidth: config.containerMaxWidth,
              scale: peek.scale,
              transformOrigin: side === 'prev' ? 'center right' : 'center left',
              opacity: peek.opacity,
              borderRadius: peek.borderRadius,
              overflow: 'hidden',
              backgroundColor: '#F2F2F2',
              border: `${config.containerBorderWidth} solid ${config.containerBorderColor}`,
              boxShadow: config.containerBoxShadow,
            }}
          >
            {coverUrl && (
              <img
                src={coverUrl}
                alt=""
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
 
export default CaseStudyPeek