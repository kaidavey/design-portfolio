import {defineField} from 'sanity'

/**
 * imageHeightField — how tall an image block stands, in vh.
 *
 * Left to itself an image is as tall as its own proportions make it, so one
 * tall screenshot can swallow the whole compact case study. A fixed height ends
 * that: the block is exactly this share of the screen height at every size, and
 * the width fills the case study frame.
 *
 * A plain image fills that box and is cropped to it — its hotspot decides what
 * survives. A framed image keeps its own proportions and sits centred, the
 * surface around it taking up the slack. Either way the height is the one thing
 * that does not move when the window does.
 *
 * `required` for the standalone Image and Framed Image blocks, which own their
 * own height. Optional inside a row or grid, where the slot already governs it.
 */
export function imageHeightField({required = false} = {}) {
  return defineField({
    name: 'height',
    title: 'Height',
    type: 'number',
    description:
      'Share of the screen height, so 40 means 40vh. The width always fills the frame. Leave blank to size from the image itself.',
    ...(required ? {initialValue: 40} : {}),
    validation: (Rule) => {
      const bounded = Rule.min(10).max(100)
      return required ? bounded.required() : bounded
    },
  })
}
