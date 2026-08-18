import { useEffect, useRef, useState } from 'react'

/**
 * Latches true the first time the element is half inside its scroll root.
 *
 * `rootRef` is the element the observed node scrolls inside. Omit it and the
 * observer falls back to the viewport, which is only correct when the node
 * really does scroll with the page.
 */
export function useScrollAnimation(rootRef) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      {
        // Read at effect time, not render time: refs are attached by now.
        root: rootRef?.current ?? null,
        threshold: 0.5,
        rootMargin: '0px',
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [isVisible, rootRef])

  return { ref, isVisible }
}
