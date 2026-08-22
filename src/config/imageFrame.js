/**
 * Frame presentation config.
 *
 * These mirror the option lists in `portfolio-cms/schemaTypes/objects/imageFrame.ts`.
 * If you add a shape, an inset step or a backdrop there, add it here too — a
 * value the frame does not recognise falls back to the default rather than
 * rendering something broken.
 */

export const FRAME_DEFAULTS = {
  aspectRatio: '16/10',
  padding: 'md',
  background: 'surface',
}

// An unrecognised ratio would collapse the frame to zero height.
export const FRAME_ASPECT_RATIOS = new Set([
  '16/10',
  '16/9',
  '4/3',
  '3/2',
  '1/1',
  '3/4',
  '9/16',
])

// Inset steps. Two values each so the gap around the image opens up as the
// frame does, instead of a phone shot floating in a sea of gray when expanded.
export const FRAME_PADDING = {
  none: '',
  sm: 'p-3 @md:p-4',
  md: 'p-6 @md:p-10',
  lg: 'p-10 @md:p-16',
}

// 'surface' wears the same skin as every other block, so it follows the theme.
// 'light' and 'dark' are fixed stages for shots that need a specific backdrop.
export const FRAME_BACKGROUND = {
  surface:
    '[background:var(--color-bg-block)] [border-color:var(--color-border-block)] [box-shadow:var(--shadow-block-inset)]',
  light: 'bg-[#f2f2f2] border-[#dedede]',
  dark: 'bg-[#1a1a1a] border-[#222222]',
}

/**
 * The box a frame occupies at a given shape.
 *
 * A portrait frame at full container width is taller than the screen — a 9:16
 * frame in the expanded column measures well over 2000px, and the reader
 * scrolls through a column of gray to reach the next block. Height is capped
 * first and the width follows from the ratio, which keeps the shape exact
 * instead of letting the cap flatten it. Landscape frames never reach the cap
 * and still fill the container.
 */
export function frameBoxStyle(aspectRatio) {
  const shape = FRAME_ASPECT_RATIOS.has(aspectRatio) ? aspectRatio : FRAME_DEFAULTS.aspectRatio
  const [width, height] = shape.split('/').map(Number)

  return {
    aspectRatio: shape,
    width: `min(100%, calc(var(--frame-max-height) * ${width / height}))`,
    maxHeight: 'var(--frame-max-height)',
  }
}
