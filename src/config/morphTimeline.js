export const MORPH_PHASE = {
  FLIGHT: 'flight', // proxy travelling, the destination concealed behind it
  REVEAL: 'reveal', // proxy parked and fading, the real thing live beneath
  DONE: 'done',     // overlay gone, page in its resting state
}

// Single source of truth for a morph's clock, in either direction. The
// spring's `visualDuration` is the moment the geometry first reaches its
// target, so every other beat is measured from that — there is no second
// duration to keep in sync with it.
export function buildMorphTimeline(cfg) {
  const flightMs = cfg.spring.visualDuration * 1000
  const proxyFadeMs = cfg.proxyFadeDuration * 1000

  return {
    flightMs,
    proxyFadeMs,
    // The destination is swapped in under an opaque proxy, so lead the cut: a
    // dropped frame then lands while it is still covered, never after.
    revealAtMs: Math.max(0, flightMs - cfg.revealLeadMs),
    // Delays are relative to the proxy's own mount, which is t=0.
    proxyFadeDelayS: cfg.spring.visualDuration,
    // The artwork dissolves on the way out and resolves on the way in; this is
    // when that crossing starts, either way.
    artworkFadeDelayS: cfg.spring.visualDuration * cfg.artworkFadeStart,
    totalMs: flightMs + proxyFadeMs,
  }
}
