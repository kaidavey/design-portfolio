import { forwardRef } from 'react'
import { m } from 'motion/react'
import { durations, easings } from './tokens'

/**
 * FadeIn - Opacity fade with optional y offset
 *
 * A wrapper component for simple fade-in animations.
 * Uses motion tokens for duration and easing.
 * Forwards all props and refs to work seamlessly as a drop-in replacement for div.
 *
 * @param {number} y - Optional y-axis offset in pixels (default: 0)
 * @param {number} duration - Duration in ms (default: durations.base)
 * @param {array} ease - Cubic bezier easing (default: easings.easeDefault)
 * @param {object} ...props - All other props forwarded to m.div
 *
 * @example
 * <FadeIn y={20}>
 *   <p>This will fade in with a 20px upward slide</p>
 * </FadeIn>
 */
const FadeIn = forwardRef(function FadeIn(
  {
    children,
    y = 0,
    duration = durations.base,
    ease = easings.easeDefault,
    ...props
  },
  ref
) {
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y }}
      transition={{
        duration: duration / 1000, // Convert ms to seconds for Motion
        ease,
      }}
      {...props}
    >
      {children}
    </m.div>
  )
})

export default FadeIn
