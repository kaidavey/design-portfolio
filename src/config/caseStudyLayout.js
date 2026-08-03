export const CASE_STUDY_LAYOUT = {
  compact: {
    containerWidth: '60vw',
    containerMaxWidth: '1048px',
    containerHeight: '75vh',
    containerMaxHeight: '700px',
    containerVerticalOffset: '8vh',
    containerBorderRadius: '60px',
    containerBorderWidth: '1px',
    containerBorderColor: '#D8D8D8',
    containerBackgroundColor: 'rgba(242, 242, 242, 0.8)',
    containerBackdropBlur: '8px',
    containerBoxShadow:
      'rgba(255, 255, 255, 0.9) -2px 2px 0px inset, rgba(0, 0, 0, 0.04) 0px 10px 20px',
    contentPaddingTop: '80px',
    contentPaddingRight: '85px',
    contentPaddingBottom: '80px',
    contentPaddingLeft: '85px',
    contentGap: '40px',
    peek: {
      revealWidth: '4vw',
      gap: '40px',
      height: '70vh',
      maxHeight: '700px',
      borderRadius: '60px',
      opacity: 1,
      scale: 0.6,
      fadeOutDuration: 0.3,
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
      coverFadeStart: 0.35,
      // Real container content: outgoing fades fast at t0 (the shrinking
      // proxy carries the eye), incoming fades in under the growing proxy
      // so it is fully present the moment the proxy fades.
      contentExitDuration: 0.12,
      contentEnterDelay: 0.15,
      contentEnterDuration: 0.3,
      // Uninvolved peek cards sliding to their new slots.
      peekSpring: { type: 'spring', stiffness: 320, damping: 26 },
      // State cleanup. Must cover (growDuration + proxyFadeDuration) * 1000
      // plus a small buffer.
      totalMs: 800,
    },
  },

  expanded: {
    contentWidth: '60%',
    contentMaxWidth: '907px',
  },
}