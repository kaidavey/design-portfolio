/**
 * Frame presentation config.
 *
 * Mirrors the options in `portfolio-cms/schemaTypes/objects/imageFrame.ts`. A
 * value the frame does not recognise falls back to the default rather than
 * rendering something broken.
 *
 * Unlike other surfaced blocks, the frame has no border, background, or inset
 * shadow. It's a clean rounded container that lets the image speak for itself.
 * Only the padding is configurable.
 */

export const FRAME_DEFAULTS = {
  padding: 'md',
}

// Padding steps for the frame around images.
export const FRAME_PADDING = {
  none: '',
  sm: 'p-3 @md:p-4',
  md: 'p-6',
  lg: 'p-10 @md:p-16',
}

/** Matches the schema's bounds, so a stray value cannot collapse a block. */
export const MIN_IMAGE_HEIGHT_VH = 10
export const MAX_IMAGE_HEIGHT_VH = 100

/**
 * The fixed height an image block stands at, as a CSS length.
 *
 * `svh` rather than `vh` on purpose: they are identical on a desktop, but on a
 * phone `vh` is measured against the *largest* viewport, so an image sized in
 * vh grows and shrinks every time the browser chrome hides on scroll. `svh` is
 * the small-viewport unit and holds still, which is the whole point of asking
 * for a fixed height.
 *
 * Returns null when no height is set — the caller then sizes from the image.
 */
export function imageHeightStyle(height) {
  if (typeof height !== 'number' || !Number.isFinite(height)) return null

  const clamped = Math.min(Math.max(height, MIN_IMAGE_HEIGHT_VH), MAX_IMAGE_HEIGHT_VH)

  return { height: `${clamped}svh` }
}
