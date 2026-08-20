import { useEffect, useState } from 'react'

/**
 * Reports whether an element has entered the viewport.
 *
 * Takes the ref rather than creating one, so a component that already holds a
 * ref on its container (for layout, measurement, anything else) can observe
 * that same node instead of nesting another wrapper.
 *
 * `useScrollAnimation` covers the reveal-on-scroll case, but it owns its ref
 * and latches at a half-visible threshold — too late to start fetching video.
 *
 * @param {React.RefObject<Element>} ref - Element to observe
 * @param {Object} options
 * @param {string} options.rootMargin - Grow the trigger area (default '200px', so loading starts just before the element scrolls in)
 * @param {number} options.threshold - Visible fraction that counts as in view
 * @param {boolean} options.once - Stay true after the first entry
 * @returns {boolean}
 */
export function useInView(ref, { rootMargin = '200px', threshold = 0.01, once = true } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Nothing to observe with — assume visible rather than hiding the video.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin, threshold, once])

  return inView
}
