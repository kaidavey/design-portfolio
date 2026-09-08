export const OPEN_PHASE = {
  FLIGHT: 'flight', // proxy travelling, the real container concealed behind it
  REVEAL: 'reveal', // proxy parked and fading, real container live beneath
  DONE: 'done',     // overlay gone, page in its resting state
}

// Single source of truth for the open morph's clock. The spring's
// `visualDuration` is the moment the geometry first reaches its target, so
// every other beat is measured from that — there is no second duration to keep
// in sync with it.
export function buildOpenMorphTimeline(om) {
  const flightMs = om.spring.visualDuration * 1000
  const proxyFadeMs = om.proxyFadeDuration * 1000

  return {
    flightMs,
    proxyFadeMs,
    // The container is swapped in under an opaque proxy, so lead the cut: a
    // dropped frame then lands while it is still covered, never after.
    revealAtMs: Math.max(0, flightMs - om.revealLeadMs),
    // Delays are relative to the proxy's own mount, which is t=0.
    proxyFadeDelayS: om.spring.visualDuration,
    coverFadeDelayS: om.spring.visualDuration * om.coverFadeStart,
    totalMs: flightMs + proxyFadeMs,
  }
}
