// Departure geometry for the home -> case study open morph.
//
// The two ends of this transition live on different routes: the cover is on
// Home, the container is on CaseStudy, and Home is already unmounted by the
// time CaseStudy first renders. Something has to carry the departure rect
// across that boundary.
//
// Router state would do it, but history state is persisted. A reload, or a
// Back that lands back on the study, would hand CaseStudy a rect measured in a
// scroll position that no longer exists and replay the morph from the wrong
// place. This is a single-hop baton instead: module scope, no history entry,
// and useless outside the hop it was written for.
//
// It is deliberately NOT cleared on read. StrictMode mounts, unmounts and
// remounts in development, and a read-and-clear baton would play the morph in
// production only. `slug` and `MAX_AGE_MS` are what make a stale baton
// unusable, so a second read costs nothing.

// A Link navigation renders the destination inside the click's own task, so
// the real gap here is a frame or two. The window only has to be wider than
// a StrictMode remount and far narrower than a human round trip.
const MAX_AGE_MS = 1000

let baton = null

/**
 * Scale currently applied by CSS — the cover is mid `group-hover:scale-105`,
 * and mid its 300ms transition into it if the click was quick.
 *
 * Tailwind v4 writes the standalone `scale` property, not a transform matrix,
 * so that is what is read first; the matrix is the fallback for anything that
 * scales the old way.
 */
function currentScale(el) {
  if (!el) return 1

  const style = getComputedStyle(el)
  const scale = parseFloat(style.scale)
  if (Number.isFinite(scale) && scale > 0) return scale

  const matrix = style.transform?.match(/matrix\(([^)]+)\)/)
  return matrix ? parseFloat(matrix[1].split(',')[0]) || 1 : 1
}

/**
 * Measure a home cover and stage it as the next open morph's origin.
 *
 * Reads the rendered `<img>` rather than rebuilding a URL from the Sanity
 * asset: the proxy has to paint the exact bytes already on screen, or its
 * first frame is a blank card while a second, uncached URL downloads.
 */
export function stageOpenMorph(slug, coverEl, radius) {
  const rect = coverEl?.getBoundingClientRect()
  if (!slug || !rect?.width) return false

  const image = coverEl.querySelector('img')

  baton = {
    slug,
    at: performance.now(),
    origin: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      radius,
      src: image?.currentSrc || image?.src || null,
      // Departing at scale 1 while the hovered cover sits at 1.05 pops on the
      // most scrutinised frame of the whole animation. Carry the hover scale
      // over and let it relax during the flight.
      coverScale: currentScale(image),
    },
  }

  return true
}

/** The staged origin for `slug`, or null if there isn't a fresh one. */
export function readOpenMorph(slug) {
  if (!baton || baton.slug !== slug) return null
  if (performance.now() - baton.at > MAX_AGE_MS) return null
  return baton.origin
}

/** Test seam. Never called by the app — the age check is the real reset. */
export function clearOpenMorph() {
  baton = null
}
