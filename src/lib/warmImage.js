/**
 * Warm the browser cache for an image that is not on screen yet.
 *
 * This is what makes the light ⇄ dark swap look instant. A themed image ships
 * two files but only ever paints one, so the other is a cache miss waiting to
 * happen: the first time the reader hits the theme toggle the browser has to go
 * and fetch it, and the old variant sits there until it lands.
 *
 * So once the visible variant has loaded — which, with lazy loading, means the
 * image is at or near the viewport — the twin is fetched at idle and at low
 * priority. By the time anyone can reach for the toggle it is already in cache,
 * and the swap is a repaint rather than a round trip.
 *
 * Deliberately fetched through an `Image` carrying the same `srcset`/`sizes` as
 * the real element, so the browser picks the same candidate it will later be
 * asked for. Warming the fallback `src` alone would warm a URL nothing renders.
 */
const warmed = new Set()

function whenIdle(run) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 2000 })
  } else {
    window.setTimeout(run, 200)
  }
}

export function warmImage({ src, srcSet, sizes }) {
  if (!src || typeof window === 'undefined') return

  // Keyed on the candidate set, not the fallback: two blocks can share a source
  // and still want different widths.
  const key = srcSet || src
  if (warmed.has(key)) return
  warmed.add(key)

  whenIdle(() => {
    const img = new window.Image()
    img.decoding = 'async'
    // Never at the expense of something the reader is actually looking at.
    if ('fetchPriority' in img) img.fetchPriority = 'low'
    if (sizes) img.sizes = sizes
    if (srcSet) img.srcset = srcSet
    img.src = src
  })
}

/** Test seam — the cache of already-warmed candidate sets is module state. */
export function resetWarmedImages() {
  warmed.clear()
}
