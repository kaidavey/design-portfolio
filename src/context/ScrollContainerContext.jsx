import { createContext, useContext, useMemo } from 'react'

/**
 * Supplies the element blocks actually scroll inside.
 *
 * Compact mode: blocks scroll inside the gray container, so that container is
 * the scroll root. Expanded mode: blocks scroll with the page, so there is no
 * provider and everything falls back to the viewport.
 *
 * Without this, entrance decisions are made against `window.innerHeight` while
 * the blocks live in a 75vh box — so blocks sitting below the box's fold but
 * above the viewport fold measure as "on screen", animate to opacity 1, and are
 * lit long before the user has seen them.
 */
const ScrollContainerContext = createContext({ rootRef: null })

export function ScrollContainerProvider({ rootRef = null, children }) {
  const value = useMemo(() => ({ rootRef }), [rootRef])

  return (
    <ScrollContainerContext.Provider value={value}>
      {children}
    </ScrollContainerContext.Provider>
  )
}

/** RefObject for the scroll root, or null when blocks scroll with the viewport. */
export function useScrollRoot() {
  return useContext(ScrollContainerContext).rootRef
}

/**
 * Top and bottom edges of the region a block has to enter to count as seen.
 *
 * Falls back to the viewport when there is no root, or when the root's ref has
 * not been attached yet — refs populate child-first during commit, so a layout
 * effect can run before an ancestor's ref lands. In practice the container
 * mounts several commits before the blocks do (they wait on the data fetch),
 * but the fallback keeps that from being load-bearing.
 */
export function scrollViewportBounds(rootRef) {
  const root = rootRef?.current

  if (!root) {
    return { top: 0, bottom: typeof window === 'undefined' ? 0 : window.innerHeight }
  }

  const rect = root.getBoundingClientRect()
  return { top: rect.top, bottom: rect.bottom }
}
