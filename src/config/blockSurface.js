/**
 * The card skin every surfaced block wears.
 *
 * Text Block, Text Card Row, the cards in an Image + Text Grid, Call to Action
 * and the Framed Image frame are all the same object as far as the eye is
 * concerned: one radius, one background, one border, one inset highlight. They
 * used to say so in five places, which is how the frame drifted out of step
 * with the rest.
 *
 * One string, imported everywhere. Changing the treatment means changing it
 * here, and nothing can fall behind.
 */
export const BLOCK_SURFACE =
  "overflow-clip rounded-[20px] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] [box-shadow:var(--shadow-block-inset)] transition-all duration-300"
