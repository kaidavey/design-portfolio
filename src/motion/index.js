/**
 * Motion Primitives & Tokens
 *
 * This module re-exports all motion utilities for convenient importing.
 * Components should import from this module, not from motion/react directly.
 *
 * @example
 * import { FadeIn, FadeInOnView, Stagger, StaggerItem, usePresenceDirection } from '../motion'
 * import { durations, springs, stagger, blockEntrance } from '../motion'
 */

export { default as FadeIn } from './FadeIn'
export { default as FadeInOnView } from './FadeInOnView'
export { Stagger, StaggerItem } from './Stagger'
export { usePresenceDirection } from './usePresenceDirection'
export { durations, easings, springs, distances, stagger } from './tokens'
