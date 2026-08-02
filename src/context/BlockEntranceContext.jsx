import { createContext, useContext } from 'react'

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