export const NAV_PHASE = {
    FLIGHT: 'flight', // proxies travelling, frame empty
    REVEAL: 'reveal', // proxies parked and fading, real content live beneath
  }
  
  // Single source of truth for the morph clock. Every consumer reads from here
  // so no two timelines can drift apart again.
  export function buildNavMorphTimeline(nm) {
    const growMs = nm.growDuration * 1000
    const proxyFadeMs = nm.proxyFadeDuration * 1000
  
    return {
      growMs,
      proxyFadeMs,
      // Content swaps under an opaque proxy; lead the cut so a dropped frame
      // lands while it is still covering, never after.
      revealAtMs: Math.max(0, growMs - (nm.revealLeadMs ?? 40)),
      growFadeStartS: nm.growDuration,
      // Shrink proxy holds until the grow reveal is done, so the two reveals
      // never overlap and compete for attention.
      shrinkFadeStartS: nm.growDuration + nm.proxyFadeDuration,
      totalMs: growMs + proxyFadeMs * 2,
    }
  }