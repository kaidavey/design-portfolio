import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSwipeNav } from '../hooks/useSwipeNav'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

/**
 * Trackpad swipe between case studies.
 *
 * A trackpad gesture is nothing but a wheel stream with a quiet gap at the
 * end, so everything here is the stream: which gestures are claimed, how far
 * they pull the peek, and that one gesture — momentum included — never
 * commits twice.
 */

const CONFIG = CASE_STUDY_LAYOUT.compact.swipe

// Motion's frame loop never ticks under jsdom — it found no
// requestAnimationFrame at import — so the spring home lands on the spot and
// the post-render commit runs inline.
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    animate: (value, to) => {
      value.set(to)
      return { stop() {} }
    },
    frame: { ...actual.frame, postRender: (fn) => fn() },
  }
})

function wheel(deltaX, deltaY = 0, init = {}) {
  const event = new WheelEvent('wheel', { deltaX, deltaY, cancelable: true, ...init })
  window.dispatchEvent(event)
  return event
}

/** Feed a gesture in frame-sized steps, the way a trackpad reports it. */
function swipe(total, step = Math.sign(total) * 5) {
  for (let moved = 0; Math.abs(moved) < Math.abs(total); moved += step) wheel(step)
}

function setup(props = {}) {
  const onSwipe = vi.fn()
  const hook = renderHook((p) => useSwipeNav(p), {
    initialProps: { active: true, enabled: true, onSwipe, resetKey: 'a', config: CONFIG, ...props },
  })
  return { onSwipe, progress: () => hook.result.current.get(), ...hook }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSwipeNav', () => {
  test('pulls the peek in proportion to travel, toward the swipe', () => {
    const { progress, onSwipe } = setup()

    swipe(CONFIG.threshold / 2)
    expect(progress()).toBeCloseTo(0.5)

    swipe(-CONFIG.threshold)
    expect(progress()).toBeCloseTo(-0.5)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  test('claims horizontal wheels from the browser', () => {
    setup()
    wheel(10)
    expect(wheel(10).defaultPrevented).toBe(true)
  })

  test('leaves a vertical scroll alone, sideways drift included', () => {
    const { progress } = setup()

    wheel(0, 10)
    const drift = wheel(4, 10)

    expect(progress()).toBe(0)
    expect(drift.defaultPrevented).toBe(false)
  })

  test('commits once at the limit, in the direction swiped', () => {
    const { onSwipe } = setup()

    swipe(CONFIG.threshold)
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith(1)

    // Momentum carrying on past the commit belongs to the same gesture.
    swipe(CONFIG.threshold * 3)
    expect(onSwipe).toHaveBeenCalledOnce()
  })

  test('holds the pull under the morph until the route changes', () => {
    const { progress, onSwipe, rerender } = setup()

    swipe(CONFIG.threshold)
    expect(onSwipe).toHaveBeenCalledOnce()
    // Springing home now would slide the card out from under the proxy.
    expect(progress()).toBe(1)

    rerender({ active: true, enabled: true, onSwipe, resetKey: 'b', config: CONFIG })
    expect(progress()).toBe(0)
  })

  test('a fresh gesture after the quiet gap can commit again', () => {
    const { onSwipe } = setup()

    swipe(CONFIG.threshold)
    vi.advanceTimersByTime(CONFIG.idleMs)
    swipe(-CONFIG.threshold)

    expect(onSwipe.mock.calls).toEqual([[1], [-1]])
  })

  test('springs home when released short of the limit', () => {
    const { progress, onSwipe } = setup()

    swipe(CONFIG.threshold * 0.8)
    vi.advanceTimersByTime(CONFIG.idleMs)

    expect(progress()).toBe(0)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  test('a gesture that meets a morph in flight is spent, even once it lands', () => {
    const { progress, onSwipe, rerender } = setup({ enabled: false })

    swipe(CONFIG.threshold / 2)
    expect(progress()).toBe(0)

    rerender({ active: true, enabled: true, onSwipe, resetKey: 'a', config: CONFIG })
    swipe(CONFIG.threshold)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  test('ignores pinch-zoom', () => {
    const { progress } = setup()
    wheel(20, 0, { ctrlKey: true })
    wheel(20, 0, { ctrlKey: true })
    expect(progress()).toBe(0)
  })

  test('only listens, and only holds Back/Forward, while active', () => {
    const { progress, rerender, onSwipe } = setup({ active: false })

    expect(wheel(20).defaultPrevented).toBe(false)
    expect(document.documentElement.style.overscrollBehaviorX).toBe('')

    rerender({ active: true, enabled: true, onSwipe, resetKey: 'a', config: CONFIG })
    expect(document.documentElement.style.overscrollBehaviorX).toBe('none')

    swipe(CONFIG.threshold / 2)
    rerender({ active: false, enabled: true, onSwipe, resetKey: 'a', config: CONFIG })
    expect(progress()).toBe(0)
    expect(document.documentElement.style.overscrollBehaviorX).toBe('')
  })
})
