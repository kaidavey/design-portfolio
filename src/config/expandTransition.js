// Single source of truth for the expand transition's timing.
//
// PHASES
//   grow     0 .............. growDuration          block column travels
//   hold     growDuration ... +holdDuration         arrival is perceptible
//   handoff  HANDOFF_AT ..... +handoffDuration      compact fades off the top
//   done     EXPAND_TOTAL_MS                        compact tree unmounts
//
// HANDOFF IS NOT A CROSSFADE.
// At HANDOFF_AT the compact column and the expanded column are pixel-identical
// and coincident. So the expanded column snaps to opacity 1 (instantly, while
// still occluded), and only the compact column fades. Composite alpha is
// a*X + (1-a)*X = X for every a, so there is no midpoint dip to the page
// background. Fading BOTH — the classic A/B crossfade — gives
// a + (1-a)*b = 0.75 at the midpoint, which reads as a flicker.
export const EXPAND = {
  ease: [0.4, 0, 0.2, 1], // matches easings.easeDefault

  growDuration: 0.6,
  holdDuration: 0.1,
  handoffDuration: 0.1,

  // Skin exit finishes inside the grow, so the container's paint is gone
  // well before the handoff.
  skinExitScale: 1.05,
  skinExitDuration: 0.3,
}

export const HANDOFF_AT = EXPAND.growDuration + EXPAND.holdDuration
export const EXPAND_TOTAL_MS = (HANDOFF_AT + EXPAND.handoffDuration) * 1000

export const EXPAND_PHASE = {
  IDLE: 'idle',
  GROW: 'grow', // covers grow + hold
  HANDOFF: 'handoff',
  DONE: 'done',
}
