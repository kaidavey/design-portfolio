import { useState } from 'react'

/**
 * usePresenceDirection
 *
 * Hook for managing direction state in AnimatePresence transitions.
 * Returns a signed direction value (-1, 0, 1) that can be passed as
 * the `custom` prop to AnimatePresence for direction-aware transitions.
 *
 * Refactored from CaseStudy.jsx to provide a reusable pattern.
 *
 * @returns {[number, function]} Tuple of [direction, setDirection]
 *
 * @example
 * const [direction, setDirection] = usePresenceDirection()
 *
 * function navigateNext() {
 *   setDirection(1)
 *   // ... perform navigation
 * }
 *
 * function navigatePrev() {
 *   setDirection(-1)
 *   // ... perform navigation
 * }
 *
 * <AnimatePresence custom={direction}>
 *   <m.div custom={direction} variants={variants}>
 *     {content}
 *   </m.div>
 * </AnimatePresence>
 */
export function usePresenceDirection() {
  const [direction, setDirection] = useState(0)
  return [direction, setDirection]
}
