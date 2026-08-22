export const CASE_STUDY_LAYOUT = {
  // Gap between body blocks, in px. MIRRORED as `gap-8` on BlockRenderer's
  // outer column; a Group overrides it for the blocks it holds.
  blockGap: 32,

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
    contentWidth: '95%',
    contentMaxWidth: '1000px',
  },

  skeleton: {
    // Shimmer — MIRRORED in @keyframes skeleton-shimmer in src/index.css
    // Horizontal gradient wave (90deg) that sweeps left-to-right across all shapes in sync
    // Animation: 5000ms total (2000ms sweep + 3000ms pause)
    shimmerDuration: '8000ms',

    // Appearance
    // Base and highlight colors live in CSS as theme-aware custom properties
    radius: '4px',
    imageRadius: '8px',

    // Timing guards — see useDelayedLoading. Below delayInMs the skeleton never
    // appears at all; once it does, minVisibleMs keeps it from blinking out.
    delayInMs: 200,
    minVisibleMs: 400,

    // Accessibility (reduced motion shows static base color)
    reducedMotionOpacity: 0.6,
  },
}
