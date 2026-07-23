/**
 * Motion Tokens
 *
 * Centralized animation constants derived from existing usage in the codebase.
 * All motion-related values must reference these tokens, not magic numbers.
 *
 * Usage: Import named exports in components
 * Example: import { durations, springs } from '../motion/tokens'
 */

/**
 * Durations (milliseconds)
 *
 * Derived from existing transitions:
 * - fast: Tailwind default (150ms) - used for most hover states
 * - base: 300ms - used for Home card transitions
 */
export const durations = {
  fast: 150,
  base: 300,
}

/**
 * Easings (cubic-bezier arrays)
 *
 * Named by intent, not by shape.
 * - easeDefault: Tailwind's default easing
 */
export const easings = {
  easeDefault: [0.4, 0, 0.2, 1],
}

/**
 * Springs (Motion spring configurations)
 *
 * Named by intent (e.g., use case), not by feel.
 * - slide: Used for case study swipe/keyboard navigation
 */
export const springs = {
  slide: {
    stiffness: 320,
    damping: 34,
  },
}

/**
 * Distances (offsets for transforms)
 *
 * Viewport-relative values to ensure consistent behavior across screen sizes.
 * - slideOffset: Off-screen distance for slide transitions (viewport width)
 * - blockEntranceY: Upward offset for block entrance fade (subtle settle)
 */
export const distances = {
  slideOffset: '100vw',
  blockEntranceY: 20, // px - small upward translation for block fade-in
}

/**
 * Stagger (orchestration timing)
 *
 * Controls cascading entrance animations for blocks.
 * - maxStaggerBlocks: Cap on how many blocks carry entrance delay (prevents multi-second delay on block 30)
 * - staggerStep: Delay between each block in the initial cascade (ms)
 *
 * Note: With gap-16 and 16:10 aspect ratio image blocks, only 1-2 blocks
 * are typically visible at once in compact mode, so stagger is most
 * perceptible in expanded mode. These are starting values to tune.
 */
export const stagger = {
  maxStaggerBlocks: 4,
  staggerStep: 100, // ms
}
