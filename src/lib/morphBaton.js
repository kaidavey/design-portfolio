// Departure geometry for the morphs that run between Home and a case study.
//
// Both directions have the same problem: the two ends live on different
// routes, and the page that owns the departure rect is already unmounted by
// the time the page that owns the destination first renders. Something has to
// carry the rect across that boundary.
//
//   open   Home stages the cover's rect      -> CaseStudy flies to its container
//   close  CaseStudy stages its container    -> Home flies to the cover
//
// Only the departure travels. The arriving page measures its own destination
// from its own DOM, which is also where the artwork comes from — see
// MorphOverlay for why the proxy must paint bytes that are already cached.
//
// Router state would carry this, but history state is persisted. A reload, or
// a Back that lands back on the page, would replay the morph from a rect
// measured in a scroll position that no longer exists. This is a single-hop
// baton instead: module scope, no history entry, and useless outside the hop
// it was written for.
//
// It is deliberately NOT cleared on read. StrictMode mounts, unmounts and
// remounts in development, and a read-and-clear baton would play the morph in
// production only. `slug`, `direction` and `MAX_AGE_MS` are what make a stale
// baton unusable, so a second read costs nothing.

// A navigation renders the destination inside the click's own task, so the
// real gap here is a frame or two. The window only has to be wider than a
// StrictMode remount and far narrower than a human round trip.
const MAX_AGE_MS = 1000

let baton = null

// Where Home was scrolled to when the reader left it. Not part of the baton:
// it outlives any single hop, because the trip back can be arbitrarily long
// and the reader still expects to land where they were. Without it the close
// morph flies to wherever the cover happens to sit on a freshly scrolled-to-top
// page, which is the wrong cover position and sometimes off screen entirely.
let homeScroll = 0

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

/** A viewport rect, or null if the element cannot be measured. */
function rectOf(el) {
  const rect = el?.getBoundingClientRect()
  return rect?.width ? rect : null
}

/**
 * Measure a home cover and stage it as the next open morph's origin.
 *
 * Reads the rendered `<img>` rather than rebuilding a URL from the Sanity
 * asset: the proxy has to paint the exact bytes already on screen, or its
 * first frame is a blank card while a second, uncached URL downloads.
 */
export function stageOpenMorph(slug, coverEl, radius) {
  const rect = rectOf(coverEl)
  if (!slug || !rect) return false

  const image = coverEl.querySelector('img')

  homeScroll = window.scrollY

  baton = {
    direction: 'open',
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
      artworkScale: currentScale(image),
    },
  }

  return true
}

/**
 * Measure the compact container and stage it as the next close morph's origin.
 *
 * Refuses a container that is not actually on screen. Mid open-morph the
 * container is concealed behind a proxy and still perfectly measurable, and a
 * close morph departing from a rect the reader has never seen a card at reads
 * as a card appearing from nowhere.
 */
export function stageCloseMorph(slug, containerEl, radius) {
  const rect = rectOf(containerEl)
  if (!slug || !rect) return false
  if (getComputedStyle(containerEl).visibility === 'hidden') return false

  baton = {
    direction: 'close',
    slug,
    at: performance.now(),
    origin: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      radius,
    },
  }

  return true
}

function read(direction, slug) {
  if (!baton || baton.direction !== direction) return null
  if (slug !== undefined && baton.slug !== slug) return null
  if (performance.now() - baton.at > MAX_AGE_MS) return null
  return baton
}

/** The staged cover rect for `slug`, or null if there isn't a fresh one. */
export function readOpenMorph(slug) {
  return read('open', slug)?.origin ?? null
}

/**
 * The staged container rect, or null. Carries the slug — Home is not told
 * which study it is returning from any other way — and the scroll offset the
 * reader left Home at, which has to be restored before the cover is measured.
 */
export function readCloseMorph() {
  const staged = read('close')
  return staged && { slug: staged.slug, homeScroll, ...staged.origin }
}

/** Test seam. Never called by the app — the age check is the real reset. */
export function clearMorph() {
  baton = null
  homeScroll = 0
}
