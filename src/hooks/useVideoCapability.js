import { useSyncExternalStore } from 'react'

/**
 * Whether this device and connection should spend bytes on decorative video.
 *
 * Every signal here is advisory: it decides whether loading a video is worth
 * it, never whether playback will succeed. Failure is handled by falling back
 * to the still image, so a wrong answer costs bandwidth at worst.
 *
 * The two live signals are subscribed rather than read during render — they
 * change while the page is open (a laptop drops to cellular, the OS motion
 * setting is toggled) and the old one-shot read never noticed.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const SLOW_NETWORKS = ['slow-2g', '2g', '3g']

// Device memory never changes, so there's nothing to subscribe to. Browsers
// that don't report it (Safari, Firefox) leave it undefined — see below.
const HAS_ENOUGH_MEMORY =
  typeof navigator === 'undefined' || typeof navigator.deviceMemory !== 'number'
    ? true
    : navigator.deviceMemory >= 4

function subscribeMotion(onChange) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION).matches
}

function subscribeNetwork(onChange) {
  const connection = navigator.connection
  if (!connection) return () => {}
  connection.addEventListener('change', onChange)
  return () => connection.removeEventListener('change', onChange)
}

function getNetworkSnapshot() {
  const connection = navigator.connection

  // The Network Information API is Chromium-only. Absent means unknown, and
  // unknown has to mean "go ahead" — treating it as a slow connection would
  // switch video off for every Safari and Firefox visitor.
  if (!connection) return true

  if (connection.saveData) return false
  return !SLOW_NETWORKS.includes(connection.effectiveType)
}

// Without a DOM there's nothing to play into, so opt out.
const serverSnapshotFalse = () => false
const serverSnapshotTrue = () => true

export function useVideoCapability() {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeMotion,
    getMotionSnapshot,
    serverSnapshotTrue
  )
  const networkIsGood = useSyncExternalStore(
    subscribeNetwork,
    getNetworkSnapshot,
    serverSnapshotFalse
  )

  return !prefersReducedMotion && networkIsGood && HAS_ENOUGH_MEMORY
}
