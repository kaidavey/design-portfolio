import { m } from 'motion/react'
import { buildOpenMorphTimeline } from '../../config/openMorphTimeline'

/**
 * The flying proxy for the open morph: one leaf card wearing the container's
 * skin with the home cover's artwork inside it, travelling from the cover's
 * rect to the container's.
 *
 * It animates real top/left/width/height rather than a transform, for the same
 * reason the nav morph does: the two endpoints have different aspect ratios and
 * different corner radii, and scaling a card between them shears its corners.
 * The proxy is a leaf, so per-frame layout is cheap.
 *
 * It is OPAQUE for the whole flight, which is what lets the real container be
 * revealed beneath it as a hard cut rather than a crossfade. Never make it
 * translucent without re-deriving the reveal.
 *
 * The artwork dissolves partway through the flight so the proxy ARRIVES as the
 * bare container skin — border, background, shadow — and the final fade is then
 * skin over identical skin, with nothing left to cross.
 */
export default function OpenMorphOverlay({ origin, dest, config }) {
  const om = config.openMorph
  const timeline = buildOpenMorphTimeline(om)

  return (
    <div className="fixed inset-0" style={{ zIndex: 9, pointerEvents: 'none' }}>
      <m.div
        initial={{
          top: origin.top,
          left: origin.left,
          width: origin.width,
          height: origin.height,
          borderRadius: origin.radius,
          opacity: 1,
        }}
        animate={{
          top: dest.top,
          left: dest.left,
          width: dest.width,
          height: dest.height,
          borderRadius: parseFloat(config.containerBorderRadius),
          opacity: 0,
        }}
        transition={{
          default: om.spring,
          opacity: {
            delay: timeline.proxyFadeDelayS,
            duration: om.proxyFadeDuration,
            ease: 'linear',
          },
        }}
        style={{
          position: 'absolute',
          overflow: 'hidden',
          // The container's own paint, matched exactly (gradient included in
          // dark mode). NOT backdrop-filtered: a second backdrop root in
          // flight is a compositing bill for wrong samples mid-travel.
          background: config.containerBackgroundColor,
          border: `${config.containerBorderWidth} solid ${config.containerBorderColor}`,
          boxShadow: config.containerBoxShadow,
          willChange: 'top, left, width, height, opacity',
        }}
      >
        {origin.src && (
          <m.img
            src={origin.src}
            alt=""
            draggable={false}
            initial={{ opacity: 1, scale: origin.coverScale }}
            animate={{ opacity: 0, scale: 1 }}
            transition={{
              scale: om.spring,
              opacity: {
                delay: timeline.coverFadeDelayS,
                duration: om.coverFadeDuration,
                ease: om.ease,
              },
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </m.div>
    </div>
  )
}
