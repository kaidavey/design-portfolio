/**
 * The card skin every surfaced block wears.
 *
 * Text Block, Text Card Row, the cards in an Image + Text Grid, and Call to Action
 * are all the same object as far as the eye is concerned: one radius, one background,
 * one border, one inset highlight.
 *
 * Note: Framed Image does NOT use this surface. It's a clean rounded container
 * with no border, background, or inset shadow.
 *
 * One string, imported everywhere. Changing the treatment means changing it
 * here, and nothing can fall behind.
 */
export const BLOCK_SURFACE =
  "overflow-clip rounded-[20px] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] [box-shadow:var(--shadow-block-inset)] transition-all duration-300"
