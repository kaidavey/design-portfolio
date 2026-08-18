import { createContext, useContext } from 'react'

/**
 * Index of the last block the compact column may paint during an expand morph.
 *
 * The expand morph un-clips the compact box so the block column can grow past
 * its edges. Every block the user ever scrolled past is still mounted at
 * opacity 1, so without a cut they all paint, widen with the column, and then
 * vanish at the handoff — the expanded column never painted them.
 *
 * `useExpandMorph` measures this against the expanded column, so the cut is
 * exactly the set of blocks that will still be there after the handoff.
 *
 * null means no cut. That is the default, and the fallback whenever the
 * measurement cannot be made.
 */
const MorphCutContext = createContext(null)

export function MorphCutProvider({ cutIndex = null, children }) {
  return <MorphCutContext.Provider value={cutIndex}>{children}</MorphCutContext.Provider>
}

export function useMorphCutIndex() {
  return useContext(MorphCutContext)
}
