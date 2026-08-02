import { createContext, useContext } from 'react'

// When true, blocks mounting inside this subtree skip their own entrance
// animation and render at final state. The parent is responsible for the
// entrance instead (see the expand transition in CaseStudy.jsx).
//
// Blocks that turn out to be below the fold re-arm themselves for the normal
// scroll-triggered entrance — see AnimatedBlock.
const BlockEntranceContext = createContext(false)

export function BlockEntranceProvider({ suppress = false, children }) {
  return (
    <BlockEntranceContext.Provider value={suppress}>
      {children}
    </BlockEntranceContext.Provider>
  )
}

export function useSuppressBlockEntrance() {
  return useContext(BlockEntranceContext)
}