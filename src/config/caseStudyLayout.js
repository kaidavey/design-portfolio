export const CASE_STUDY_LAYOUT = {
  compact: {
    containerWidth: '60vw',
    containerMaxWidth: '1048px',
    containerHeight: '75vh',
    containerMaxHeight: '700px',
    containerVerticalOffset: '8vh',
    containerBorderRadius: '60px',
    containerBorderWidth: '1px',
    containerBorderColor: 'var(--color-border)',
    containerBackgroundColor: 'var(--color-bg-container)',
    containerBackdropBlur: '8px',
    containerBoxShadow: 'var(--shadow-container-inset)',
    contentPaddingTop: '80px',
    contentPaddingRight: '85px',
    contentPaddingBottom: '80px',
    contentPaddingLeft: '85px',
    contentGap: '40px',
    peek: {
      revealWidth: '2vw',
      gap: '40px',
      height: '70vh',
      maxHeight: '700px',
      borderRadius: '60px',
      opacity: 1,
      scale: 0.6,
      fadeOutDuration: 0.3,
      magnetism: {
        radius: 200,              // px — cursor distance before falloff starts
        peekGain: 50,             // ← EDIT THIS: px additional translateX at full strength
        leanGain: 8,              // degrees — rotation at full strength
        leanCap: 8,               // degrees — hard cap (prevent over-rotation)
        distanceWeightY: 0.4,     // y-axis weight in distance calc (vs 1.0 for x)
        verticalGain: 0.2,        // ← EDIT THIS: multiplier for cursor Y displacement (0.0–1.0)
        springEnter: { stiffness: 120, damping: 28 },  // fast approach (sped up)
        springExit: { stiffness: 120, damping: 28 },   // slow retreat (sped up)
      },
    },

    // Navigation morph: peek cover grows into the container slot while the
    // outgoing study's cover shrinks into the opposite peek slot. All timing
    // lives here; the component reads, never hardcodes.
    navMorph: {
      ease: [0.4, 0, 0.2, 1],
      // Proxy travel time (peek rect -> container rect and the reverse).
      growDuration: 0.55,
      // Both proxies fade out after arrival, revealing the real elements
      // already sitting at the destination rects. For the growing proxy
      // this is the crossfade with the real gray container.
      proxyFadeDuration: 0.2,
      // Growing proxy: fraction of the grow at which its cover image starts
      // fading out, so the proxy arrives wearing the gray container skin
      // (border + shadow, no image) before the final crossfade.
      coverFadeStart: 0.05,
      // Uninvolved peek cards sliding to their new slots.
      peekSpring: { type: 'spring', stiffness: 320, damping: 26 },
      // State cleanup. Must cover the shrink proxy's delayed fade:
      // (growDuration + proxyFadeDuration + proxyFadeDuration) * 1000
      totalMs: 1000,
      revealLeadMs: 40,
    },
  },

  expanded: {
    contentWidth: '60%',
    contentMaxWidth: '907px',
  },

  skeleton: {
    // Pulse — MIRRORED in @keyframes skeleton-pulse in src/index.css
    // Do not try to drive the keyframe from JS; it defeats compositing.
    // If you change pulseDuration or pulseFloor, update the CSS keyframe to match.
    pulseDuration: '2400ms',
    pulseFloor: 0.35,        // bottom of the pulse; below ~0.3 reads as broken, not loading
    pulseStaggerMs: 180,     // applied as a NEGATIVE animation-delay per block index

    // Appearance
    // fill color now lives in CSS as --color-skeleton (theme-aware)
    radius: '6px',
    imageRadius: '12px',

    // Timing guards
    delayInMs: 0,            // TEMP: set to 0 to always show skeleton (normally 200)
    minVisibleMs: 2000,      // TEMP: hold for 2s to see it clearly (normally 400)

    // Accessibility
    reducedMotionOpacity: 0.6,
  },
}
