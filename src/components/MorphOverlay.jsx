import { m } from 'motion/react'
import { buildMorphTimeline } from '../config/morphTimeline'

/**
 * The flying proxy shared by both route morphs: one leaf card wearing the
 * case study container's skin, with cover artwork inside it, travelling
 * between the cover's rect and the container's.
 *
 * It animates real top/left/width/height rather than a transform, for the same
 * reason the nav morph does: the two endpoints have different aspect ratios and
 * different corner radii, and scaling a card between them shears its corners.
 * The proxy is a leaf, so per-frame layout is cheap.
 *
 * It is OPAQUE for the whole flight, which is what lets the destination be
 * revealed beneath it as a hard cut rather than a crossfade. Never make it
 * translucent without re-deriving the reveal.
 *
 * That opacity has to be built rather than inherited. The container's own
 * background is 80% alpha over a backdrop-filter, and the proxy deliberately
 * carries no filter — one more backdrop root in flight is a compositing bill
 * for samples that are wrong mid-travel anyway. Over the empty case study page
 * the missing filter costs nothing, but the close morph flies over a full grid
 * of covers, and an unblurred 80% card shows every one of them through it. So
 * the solid tone the container resolves to goes underneath, and the real
 * background — gradient and all, in dark mode — paints over it.
 *
 * Opening, the artwork dissolves early so the proxy ARRIVES as the bare
 * container skin. Closing, it resolves late so the proxy arrives as the cover.
 * Either way the final fade is like over like, with nothing left to cross.
 *
 * @param {object} from - {top,left,width,height,radius} it departs from
 * @param {object} to - the same, where it lands
 * @param {object} artwork - {src, scaleFrom} the cover art it carries, if any
 * @param {boolean} resolving - artwork fades in (closing) rather than out
 * @param {object} config - the matching {open,close}Morph timing block
 * @param {object} skin - the container's paint, from CASE_STUDY_LAYOUT.compact
 */
export default function MorphOverlay({ from, to, artwork, resolving = false, config, skin }) {
  const timeline = buildMorphTimeline(config)

  return (
    <div className="fixed inset-0" style={{ zIndex: 9, pointerEvents: 'none' }}>
      <m.div
        initial={{
          top: from.top,
          left: from.left,
          width: from.width,
          height: from.height,
          borderRadius: from.radius,
          opacity: 1,
        }}
        animate={{
          top: to.top,
          left: to.left,
          width: to.width,
          height: to.height,
          borderRadius: to.radius,
          opacity: 0,
        }}
        transition={{
          default: config.spring,
          opacity: {
            delay: timeline.proxyFadeDelayS,
            duration: config.proxyFadeDuration,
            ease: 'linear',
          },
        }}
        style={{
          position: 'absolute',
          overflow: 'hidden',
          background: skin.containerBackgroundSolid,
          border: `${skin.containerBorderWidth} solid ${skin.containerBorderColor}`,
          boxShadow: skin.containerBoxShadow,
          willChange: 'top, left, width, height, opacity',
        }}
      >
        {/* The container's own paint, matched exactly, over the opaque base. */}
        <div
          className="absolute inset-0"
          style={{ background: skin.containerBackgroundColor }}
        />

        {artwork?.src && (
          <m.img
            src={artwork.src}
            alt=""
            draggable={false}
            initial={{ opacity: resolving ? 0 : 1, scale: artwork.scaleFrom ?? 1 }}
            animate={{ opacity: resolving ? 1 : 0, scale: 1 }}
            transition={{
              scale: config.spring,
              opacity: {
                delay: timeline.artworkFadeDelayS,
                duration: config.artworkFadeDuration,
                ease: config.ease,
              },
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </m.div>
    </div>
  )
}
