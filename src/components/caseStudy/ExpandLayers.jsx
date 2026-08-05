import { motion } from 'framer-motion'
import { EXPAND, EXPAND_PHASE } from '../../config/expandTransition'

// ---------------------------------------------------------------------------
// LAYER OWNERSHIP
//
// ExpandMorphLayer  owns width / x / y / opacity of the COMPACT column.
// ExpandedLayer     owns opacity of the EXPANDED column.
//
// Neither carries `variants`, `key`, or `drag`. Those belong to the slug-swap
// layer nested INSIDE ExpandMorphLayer. Enabling `drag` makes an element a
// projection node that writes `transform` directly; the expand morph also
// writes `transform`. On one element they overwrite each other.
// ---------------------------------------------------------------------------

const geo = { duration: EXPAND.growDuration, ease: EXPAND.ease }

/**
 * Wraps the compact content. Inert until `morph` lands, then travels to the
 * measured expanded geometry and fades out during the handoff.
 *
 * Opacity is 1 for the whole grow + hold. Nothing that CONTAINS blocks may
 * fade or scale while the blocks are travelling — parent opacity multiplies
 * onto children and kills the morph.
 */
export function ExpandMorphLayer({ phase, morph, layerRef, children }) {
  const growing = phase === EXPAND_PHASE.GROW && morph
  const handingOff = phase === EXPAND_PHASE.HANDOFF && morph

  let animate
  if (growing) {
    animate = {
      width: [morph.fromWidth, morph.toWidth],
      x: [0, morph.dx],
      y: [morph.fromY, morph.toY],
      opacity: 1,
    }
  } else if (handingOff) {
    // Hold the arrived geometry and fade. Restating width/x/y (rather than
    // omitting them) stops Motion relaxing them back toward the style values.
    animate = {
      width: morph.toWidth,
      x: morph.dx,
      y: morph.toY,
      opacity: 0,
    }
  } else {
    // IDLE or DONE: no animation, just normal layout
    animate = {
      width: '100%',
      x: 0,
      y: 0,
      opacity: 1,
    }
  }

  const transition = handingOff
    ? { opacity: { duration: EXPAND.handoffDuration, ease: 'linear' }, default: { duration: 0 } }
    : growing
      ? { width: geo, x: geo, y: geo, opacity: { duration: 0 } }
      : { duration: 0 } // IDLE/DONE: instant, no animation

  return (
    <motion.div
      ref={layerRef}
      initial={false}
      animate={animate}
      transition={transition}
      style={{
        width: '100%',
        flexShrink: 0,
        transformOrigin: 'top left',
        willChange: morph ? 'width, transform, opacity' : 'auto',
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Wraps the expanded content. Mounted at final geometry from frame one, never
 * transformed, so its rect is a valid FLIP target.
 *
 * Opacity is 0 through grow + hold, then snaps to 1 INSTANTLY at the handoff
 * while still occluded by the opaque compact column. It does not fade in.
 * See config/expandTransition.js for why a symmetric crossfade dips.
 *
 * `initial` is an explicit object, never `false`. `initial={false}` combined
 * with a keyframe-array `animate` resolves ambiguously and was painting this
 * layer visible for the entire grow.
 */
export function ExpandedLayer({ phase, layerRef, style, children }) {
  const hidden = phase === EXPAND_PHASE.GROW

  return (
    <motion.div
      ref={layerRef}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0 }}
    >
      {children}
    </motion.div>
  )
}
