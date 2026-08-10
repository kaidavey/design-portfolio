import { createContext, useContext } from 'react'

const BlockEntranceContext = createContext({ suppress: false, instant: false })

export function BlockEntranceProvider({ suppress = false, instant = false, children }) {
  return (
    <BlockEntranceContext.Provider value={{ suppress, instant }}>
      {children}
    </BlockEntranceContext.Provider>
  )
}

export function useSuppressBlockEntrance() {
  const context = useContext(BlockEntranceContext)
  // Backwards compatibility: if context is a boolean, convert it
  if (typeof context === 'boolean') {
    return context
  }
  return context.suppress
}

export function useInstantBlockEntrance() {
  const context = useContext(BlockEntranceContext)
  if (typeof context === 'boolean') {
    return false
  }
  return context.instant
}
