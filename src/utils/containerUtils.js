/**
 * Container Layout Utilities
 *
 * These utilities define the contract between the Shell and blocks.
 * Blocks use these to maintain consistent spacing and full-bleed behavior.
 */

/**
 * Get the shell's horizontal padding value
 * Must match Shell's padding: clamp(24px, 4vw, 48px)
 */
export function getShellPadding() {
  return 'clamp(24px, 4vw, 48px)'
}

/**
 * Full-bleed utility for blocks that need to break out to container edges
 *
 * Usage: <div className={fullBleed()}>...</div>
 *
 * How it works:
 * - Negative margin pulls element to container edges
 * - Padding restores the inset for content
 * - Result: Background/border bleeds full-width, content stays aligned
 */
export function fullBleed() {
  return 'mx-[calc(-1*clamp(24px,4vw,48px))] px-[clamp(24px,4vw,48px)]'
}

/**
 * Readable max-width for text-heavy blocks
 *
 * Usage: <div className="max-w-readable mx-auto">...</div>
 *
 * Use this for:
 * - Paragraph blocks
 * - Long-form text
 * - Centered content that needs optimal line length
 *
 * Do NOT use for:
 * - Image grids
 * - Multi-column layouts
 * - Blocks that should fill container width
 */
export const READABLE_MAX_WIDTH = '70ch' // ~770px at 16px font-size

/**
 * Container breakpoints for reference
 *
 * Compact state: ~900px - 96px padding = ~804px content
 * Expanded state: viewport width - 96px padding = ~1344px content (at 1440px viewport)
 *
 * Use @container queries in blocks:
 * - @sm: 640px+  (mobile → tablet)
 * - @md: 768px+  (tablet → desktop, triggers in compact)
 * - @lg: 1024px+ (desktop wide, only in expanded)
 * - @xl: 1280px+ (desktop extra wide, only in expanded)
 */
