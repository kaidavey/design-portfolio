import { forwardRef } from 'react'
import { m } from 'motion/react'
import { durations } from './tokens'

/**
 * Stagger - Container for orchestrated children animations
 *
 * Wraps children and provides stagger timing context via Motion's staggerChildren.
 * Use with StaggerItem children for coordinated entrance animations.
 *
 * @param {number} stagger - Delay between each child in ms (default: 100ms)
 * @param {object} ...props - All other props forwarded to m.div
 *
 * @example
 * <Stagger stagger={150}>
 *   <StaggerItem>First item</StaggerItem>
 *   <StaggerItem>Second item (150ms delay)</StaggerItem>
 *   <StaggerItem>Third item (300ms delay)</StaggerItem>
 * </Stagger>
 */
export const Stagger = forwardRef(function Stagger(
  {
    children,
    stagger = 100,
    ...props
  },
  ref
) {
  return (
    <m.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger / 1000, // Convert ms to seconds
          },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  )
})

/**
 * StaggerItem - Individual item within a Stagger container
 *
 * Animates opacity and optional y offset in response to parent Stagger timing.
 * Must be a direct child of Stagger to receive orchestration.
 *
 * @param {number} y - Optional y-axis offset in pixels (default: 0)
 * @param {number} duration - Duration in ms (default: durations.base)
 * @param {object} ...props - All other props forwarded to m.div
 *
 * @example
 * <StaggerItem y={10}>
 *   <p>This item will fade in with a 10px upward slide</p>
 * </StaggerItem>
 */
export const StaggerItem = forwardRef(function StaggerItem(
  {
    children,
    y = 0,
    duration = durations.base,
    ...props
  },
  ref
) {
  return (
    <m.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: duration / 1000, // Convert ms to seconds
          },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  )
})
