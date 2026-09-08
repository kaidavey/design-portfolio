import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { stageOpenMorph, readOpenMorph, clearOpenMorph } from '../lib/openMorphBaton'
import { buildOpenMorphTimeline } from '../config/openMorphTimeline'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

/**
 * Open morph — the home cover growing into the compact container.
 *
 * The two halves under test are the ones that can silently strand the page:
 * the baton, which is the only thing carrying the departure rect across a
 * route change, and the clock, which decides when the real container is
 * uncovered. A baton that reads back when it shouldn't replays the morph from
 * a rect that no longer exists; a clock whose reveal lands after the proxy has
 * faded shows the page through the gap.
 */

/** A stand-in for a rendered cover: a measurable box around an <img>. */
function coverElement({ rect, src = 'cover.jpg', scale = 'none', transform = 'none' } = {}) {
  const el = document.createElement('div')
  const img = document.createElement('img')

  img.src = src
  el.appendChild(img)
  document.body.appendChild(el)

  el.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    width: 440,
    height: 302,
    right: 440,
    bottom: 302,
    ...rect,
  })

  vi.spyOn(window, 'getComputedStyle').mockImplementation((node) =>
    node === img ? { scale, transform } : { scale: 'none', transform: 'none' }
  )

  return el
}

beforeEach(() => clearOpenMorph())
afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('open morph baton', () => {
  test('hands the measured cover to the study it was staged for', () => {
    stageOpenMorph('atlas', coverElement({ rect: { top: 120, left: 40 } }), 30)

    expect(readOpenMorph('atlas')).toMatchObject({
      top: 120,
      left: 40,
      width: 440,
      height: 302,
      radius: 30,
      src: expect.stringContaining('cover.jpg'),
    })
  })

  test('carries the hover scale so the proxy does not pop on frame one', () => {
    // Tailwind v4 writes the standalone property; the cover is hovered at the
    // moment of every click that matters.
    stageOpenMorph('atlas', coverElement({ scale: '1.05' }), 30)

    expect(readOpenMorph('atlas').coverScale).toBeCloseTo(1.05)
  })

  test('falls back to a transform matrix for anything scaled the old way', () => {
    stageOpenMorph('atlas', coverElement({ transform: 'matrix(1.05, 0, 0, 1.05, 0, 0)' }), 30)

    expect(readOpenMorph('atlas').coverScale).toBeCloseTo(1.05)
  })

  test('rests at scale 1 when nothing is transforming the cover', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('atlas').coverScale).toBe(1)
  })

  test('is refused by any study but the one it was staged for', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('meridian')).toBeNull()
  })

  test('goes stale, so a later visit never replays a dead rect', () => {
    const now = vi.spyOn(performance, 'now')

    now.mockReturnValue(0)
    stageOpenMorph('atlas', coverElement(), 30)

    now.mockReturnValue(999)
    expect(readOpenMorph('atlas')).not.toBeNull()

    now.mockReturnValue(1001)
    expect(readOpenMorph('atlas')).toBeNull()
  })

  test('survives being read twice, as StrictMode will', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('atlas')).toEqual(readOpenMorph('atlas'))
  })

  test('stages nothing from an unmeasurable cover', () => {
    expect(stageOpenMorph('atlas', null, 30)).toBe(false)
    expect(readOpenMorph('atlas')).toBeNull()
  })
})

describe('open morph timeline', () => {
  const om = CASE_STUDY_LAYOUT.compact.openMorph
  const timeline = buildOpenMorphTimeline(om)

  test('uncovers the container just before the proxy lands on it', () => {
    expect(timeline.revealAtMs).toBe(timeline.flightMs - om.revealLeadMs)
    expect(timeline.revealAtMs).toBeLessThan(timeline.flightMs)
  })

  test('starts the proxy fade only once it has arrived', () => {
    expect(timeline.proxyFadeDelayS * 1000).toBeGreaterThanOrEqual(timeline.revealAtMs)
  })

  test('dissolves the artwork before arrival, so the proxy lands as bare skin', () => {
    const coverFadeEndsMs = (timeline.coverFadeDelayS + om.coverFadeDuration) * 1000

    expect(timeline.coverFadeDelayS * 1000).toBeLessThan(timeline.flightMs)
    expect(coverFadeEndsMs).toBeLessThanOrEqual(timeline.proxyFadeDelayS * 1000)
  })

  test('holds the overlay until its own fade is finished', () => {
    expect(timeline.totalMs).toBe(timeline.proxyFadeDelayS * 1000 + timeline.proxyFadeMs)
  })
})
