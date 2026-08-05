import { motion } from 'framer-motion'
import { getCoverUrl } from '../CaseStudyPeek'

// Overlay proxies for the navigation morph. Two leaf cards (skin + cover
// image, no block content, no backdrop-filter) travel between the measured
// peek-card rects and the container rect, then fade out over the real
// elements already sitting at their destinations.
//
// These animate real width/height, not scale — both endpoints share the
// 60px corner radius family, and scaling would distort the corners. The
// proxies are leaves, so per-frame layout is cheap. Same deliberate
// exception to the no-layout-animation rule as the expand block morph.
//
// role="grow":   cover fully visible at departure, fades out during the
//                latter part of the flight so the proxy ARRIVES as a bare
//                gray container skin (border + shadow, no image), then the
//                whole proxy crossfades with the real container beneath it.
// role="shrink": the mirror — departs container-gray, cover fades in as it
//                travels, lands as a full cover card on the peek slot.
function NavMorphProxy({ role, from, to, fromRadius, toRadius, coverUrl, config }) {
  const nm = config.navMorph
  const geo = { duration: nm.growDuration, ease: nm.ease }

  const imageInitial = { opacity: role === 'grow' ? 1 : 0 }
  const imageAnimate = { opacity: role === 'grow' ? 0 : 1 }
  const imageTransition =
    role === 'grow'
      ? {
          delay: nm.growDuration * nm.coverFadeStart,
          duration: 0.2, // Fixed fast fade
          ease: nm.ease,
        }
      : { duration: nm.growDuration * (1 - nm.coverFadeStart), ease: nm.ease }

  // Shrinking proxy waits for growing proxy's crossfade to complete before fading
  const opacityFadeDelay =
    role === 'shrink'
      ? nm.growDuration + nm.proxyFadeDuration // Wait for grow proxy to finish
      : nm.growDuration // Start when arriving

  return (
    <motion.div
      initial={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: fromRadius,
        opacity: 1,
      }}
      animate={{
        top: to.top,
        left: to.left,
        width: to.width,
        height: to.height,
        borderRadius: toRadius,
        opacity: 0,
      }}
      transition={{
        top: geo,
        left: geo,
        width: geo,
        height: geo,
        borderRadius: geo,
        opacity: { delay: opacityFadeDelay, duration: nm.proxyFadeDuration, ease: 'linear' },
      }}
      style={{
        position: 'absolute',
        overflow: 'hidden',
        // Solid fill, deliberately NOT the translucent container color and
        // NOT backdrop-filtered — two extra backdrop roots in flight is a
        // compositing bill with wrong sampling mid-travel anyway. Behind
        // the container it lands on sits the plain gray page, so solid
        // #F2F2F2 with the container's border + shadow reads as the same
        // surface at the crossfade.
        backgroundColor: '#F2F2F2',
        border: `${config.containerBorderWidth} solid ${config.containerBorderColor}`,
        boxShadow: config.containerBoxShadow,
        willChange: 'top, left, width, height',
      }}
    >
      {coverUrl && (
        <motion.img
          src={coverUrl}
          alt=""
          draggable={false}
          initial={imageInitial}
          animate={imageAnimate}
          transition={imageTransition}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </motion.div>
  )
}

export default function NavMorphOverlay({ navMorph, config }) {
  const containerRadius = parseFloat(config.containerBorderRadius)
  const peekRadius = containerRadius * config.peek.scale

  return (
    <div className="fixed inset-0" style={{ zIndex: 8, pointerEvents: 'none' }}>
      {/* Outgoing study's cover: container rect -> opposite peek rect. */}
      <NavMorphProxy
        role="shrink"
        from={navMorph.container}
        to={navMorph.shrinkTo}
        fromRadius={containerRadius}
        toRadius={peekRadius}
        coverUrl={getCoverUrl(navMorph.leavingStudy)}
        config={config}
      />
      {/* Incoming study's cover: its peek rect -> container rect. */}
      <NavMorphProxy
        role="grow"
        from={navMorph.growFrom}
        to={navMorph.container}
        fromRadius={peekRadius}
        toRadius={containerRadius}
        coverUrl={getCoverUrl(navMorph.enteringStudy)}
        config={config}
      />
    </div>
  )
}
