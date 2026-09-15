import { useEffect, useRef } from 'react'
import { animate, frame, useMotionValue } from 'framer-motion'

// Trackpad swipe between case studies. A two-finger horizontal swipe arrives
// as a stream of wheel events; this folds them into a signed progress value
// (-1 prev … +1 next) that the peeks read directly, so the neighbour follows
// the fingers out from the edge. At ±1 the gesture commits and hands off to
// the nav morph, which measures the pulled-out peek where it stands and grows
// from there.
//
// There is no "fingers lifted" event for a trackpad — the stream just stops.
// A quiet gap of `idleMs` is the gesture's end: short of the limit, the peek
// springs home. macOS keeps the stream flowing through momentum after a
// flick, which is what lets a quick flick commit without dragging the whole
// distance.
//
// `active` attaches the listener at all (compact view only). `enabled` is the
// transient gate — a morph in flight, no neighbours — and a gesture that runs
// into it is spent, so momentum outlasting a morph cannot start another.
//
// `resetKey` is the route. After a commit the pull holds until it changes —
// see the effect below.
export function useSwipeNav({ active, enabled, onSwipe, resetKey, config }) {
  const progress = useMotionValue(0)
  const settleRef = useRef(null)

  // Read by the listener, which is attached once per `active` and would
  // otherwise close over the first render's guards.
  const latest = useRef({ enabled, onSwipe })
  useEffect(() => {
    latest.current = { enabled, onSwipe }
  })

  // The peek that was pulled out stays on screen until the route change
  // commits and it exits, and the route change is a transition — it can land
  // a frame or two after the morph has started. Springing home at the commit
  // slides the card out from under the departing proxy while it is still
  // visible. Held until here, the slot is empty (its next card waits out the
  // morph at opacity 0), so the spring home is never seen.
  useEffect(() => {
    springHome(progress, settleRef, config.releaseSpring)
  }, [resetKey, progress, config])

  useEffect(() => {
    if (!active) return

    const { threshold, idleMs, axisLockPx, releaseSpring } = config

    let axis = null // 'x' | 'y', claimed once per gesture
    let probeX = 0
    let probeY = 0
    let travel = 0 // signed wheel delta toward the limit, px
    let spent = false // committed or blocked: swallow the rest of the gesture
    let idleTimer = null

    // Also covers a commit whose route change never came, so a peek is never
    // left stranded out at the limit.
    function endGesture() {
      axis = null
      probeX = 0
      probeY = 0
      spent = false
      springHome(progress, settleRef, releaseSpring)
    }

    function onWheel(e) {
      if (e.ctrlKey) return // pinch-zoom arrives as a ctrl wheel

      clearTimeout(idleTimer)
      idleTimer = setTimeout(endGesture, idleMs)

      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerWidth : 1
      let dx = e.deltaX * unit

      // Claim an axis from the first few px, then hold it. Without this, the
      // sideways drift in an ordinary vertical scroll tugs at the peeks.
      if (axis === null) {
        probeX += dx
        probeY += e.deltaY * unit
        if (Math.hypot(probeX, probeY) < axisLockPx) return
        axis = Math.abs(probeX) > Math.abs(probeY) ? 'x' : 'y'
        if (axis === 'x') {
          dx = probeX
          // Pick up from wherever a spring-home left off, so re-grabbing a
          // peek on its way back does not snap it.
          settleRef.current?.stop()
          settleRef.current = null
          travel = progress.get() * threshold
        }
      }

      if (axis !== 'x') return
      e.preventDefault()
      if (spent) return

      if (!latest.current.enabled) {
        spent = true
        springHome(progress, settleRef, releaseSpring)
        return
      }

      travel = Math.max(-threshold, Math.min(threshold, travel + dx))
      const p = travel / threshold
      progress.set(p)

      if (Math.abs(p) === 1) {
        spent = true
        // The morph measures the peek synchronously inside onSwipe, and the
        // `set` above has not reached the DOM yet — Motion writes styles on
        // the next frame. Measured now, the proxy departs from where the card
        // was a frame ago, a whole wheel step behind it. After that frame's
        // render the two agree. The pull then holds until the route changes.
        const dir = Math.sign(p)
        frame.postRender(() => latest.current.onSwipe(dir))
      }
    }

    // Chrome and Safari read an unclaimed horizontal swipe as Back/Forward.
    // Scoped to this view rather than set globally, so Home keeps the gesture.
    const root = document.documentElement
    const prevOverscroll = root.style.overscrollBehaviorX
    root.style.overscrollBehaviorX = 'none'

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      root.style.overscrollBehaviorX = prevOverscroll
      clearTimeout(idleTimer)
      settleRef.current?.stop()
      progress.jump(0)
    }
  }, [active, config, progress])

  return progress
}

function springHome(progress, settleRef, spring) {
  settleRef.current?.stop()
  settleRef.current = progress.get() === 0 ? null : animate(progress, 0, spring)
}
