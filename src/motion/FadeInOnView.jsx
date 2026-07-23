import { forwardRef } from 'react'
import { m } from 'motion/react'
import { durations, easings, distances } from './tokens'

/**
 * FadeInOnView - Viewport-triggered fade with optional y offset
 *
 * Animates when element enters viewport using whileInView.
 * Separate from FadeIn (which uses initial/animate/exit) because
 * viewport triggers are a different mental model and merging them
 * would cause prop explosion.
 *
 * Designed for BlockRenderer: blocks fade up into view as they scroll in.
 *
 * @param {number} y - Y-axis offset in pixels (default: distances.blockEntranceY)
 * @param {number} duration - Duration in ms (default: durations.base)
 * @param {array} ease - Cubic bezier easing (default: easings.easeDefault)
 * @param {number} delay - Delay before animation starts in ms (default: 0)
 * @param {object} viewport - IntersectionObserver options for whileInView
 * @param {object} ...props - All other props forwarded to m.div
 *
 * @example
 * <FadeInOnView
 *   y={20}
 *   delay={100}
 *   viewport={{
 *     root: scrollContainerRef,
 *     once: true,
 *     amount: 0.15,
 *     margin: "0px 0px -50px 0px"
 *   }}
 * >
 *   <BlockComponent />
 * </FadeInOnView>
 */
const FadeInOnView = forwardRef(function FadeInOnView(
  {
    children,
    y = distances.blockEntranceY,
    duration = durations.base,
    ease = easings.easeDefault,
    delay = 0,
    viewport = {},
    ...props
  },
  ref
) {
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...viewport, once: true }}
      transition={{
        duration: duration / 1000, // Convert ms to seconds for Motion
        ease,
        delay: delay / 1000, // Convert ms to seconds
      }}
      {...props}
    >
      {children}
    </m.div>
  )
})

export default FadeInOnView
