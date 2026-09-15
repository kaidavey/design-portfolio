import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  morphRect,
  stageOpenMorph,
  stageCloseMorph,
  readOpenMorph,
  readCloseMorph,
  clearMorph,
} from '../lib/morphBaton'
import { buildMorphTimeline } from '../config/morphTimeline'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

/**
 * Route morphs — the home cover growing into the compact container, and the
 * container shrinking back into it.
 *
 * The two halves under test are the ones that can silently strand a page: the
 * baton, which is the only thing carrying the departure rect across a route
 * change, and the clock, which decides when the destination is uncovered. A
 * baton that reads back when it shouldn't replays a morph from a rect that no
 * longer exists; a clock whose reveal lands after the proxy has faded shows
 * the page through the gap.
 */

/**
 * A rect that answers like the real thing: geometry exposed as accessors on
 * the prototype, nothing own. jsdom's getBoundingClientRect hands back a plain
 * object, so without this the trap morphRect exists to close cannot be
 * reproduced here — which is exactly how it reached a browser.
 */
function domRectLike(values) {
  const proto = {}

  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(proto, key, { get: () => value, enumerable: false })
  }

  return Object.create(proto)
}

/** A stand-in for a rendered cover: a measurable box around an <img>. */
function coverElement({ rect, src = 'cover.jpg', scale = 'none', transform = 'none' } = {}) {
  const el = document.createElement('div')
  const img = document.createElement('img')

  img.src = src
  el.appendChild(img)
  document.body.appendChild(el)

  el.getBoundingClientRect = () =>
    domRectLike({ top: 0, left: 0, width: 440, height: 302, right: 440, bottom: 302, ...rect })

  vi.spyOn(window, 'getComputedStyle').mockImplementation((node) =>
    node === img ? { scale, transform } : { scale: 'none', transform: 'none', visibility: 'visible' }
  )

  return el
}

/** A stand-in for the compact container. */
function containerElement({ rect, visibility = 'visible' } = {}) {
  const el = document.createElement('div')
  document.body.appendChild(el)

  el.getBoundingClientRect = () =>
    domRectLike({ top: 72, left: 288, width: 864, height: 675, right: 1152, bottom: 747, ...rect })

  vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ visibility }))

  return el
}

beforeEach(() => clearMorph())
afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('morphRect', () => {
  test('copies a DOMRect into something that can actually be spread', () => {
    const el = { getBoundingClientRect: () => domRectLike({ top: 12, left: 34, width: 482, height: 331 }) }

    // The trap, stated: a DOMRect owns nothing, so spreading it yields nothing
    // and every geometry target silently becomes undefined.
    expect(Object.keys(el.getBoundingClientRect())).toEqual([])

    expect({ ...morphRect(el, { radius: 30 }) }).toEqual({
      top: 12,
      left: 34,
      width: 482,
      height: 331,
      radius: 30,
    })
  })

  test('is null for anything that cannot be measured', () => {
    expect(morphRect(null, { radius: 30 })).toBeNull()
    expect(morphRect({ getBoundingClientRect: () => domRectLike({ width: 0 }) }, {})).toBeNull()
  })
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

    expect(readOpenMorph('atlas').artworkScale).toBeCloseTo(1.05)
  })

  test('falls back to a transform matrix for anything scaled the old way', () => {
    stageOpenMorph('atlas', coverElement({ transform: 'matrix(1.05, 0, 0, 1.05, 0, 0)' }), 30)

    expect(readOpenMorph('atlas').artworkScale).toBeCloseTo(1.05)
  })

  test('rests at scale 1 when nothing is transforming the cover', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('atlas').artworkScale).toBe(1)
  })

  test('is refused by any study but the one it was staged for', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('meridian')).toBeNull()
  })

  test('stages nothing from an unmeasurable cover', () => {
    expect(stageOpenMorph('atlas', null, 30)).toBe(false)
    expect(readOpenMorph('atlas')).toBeNull()
  })
})

describe('close morph baton', () => {
  test('hands the container rect and the slug back to Home', () => {
    stageCloseMorph('atlas', containerElement(), 60)

    expect(readCloseMorph()).toMatchObject({
      slug: 'atlas',
      top: 72,
      left: 288,
      width: 864,
      height: 675,
      radius: 60,
    })
  })

  test('refuses a container that is concealed behind another morph', () => {
    expect(stageCloseMorph('atlas', containerElement({ visibility: 'hidden' }), 60)).toBe(false)
    expect(readCloseMorph()).toBeNull()
  })

  test('stages nothing when there is no compact container, as when expanded', () => {
    expect(stageCloseMorph('atlas', null, 60)).toBe(false)
    expect(readCloseMorph()).toBeNull()
  })

  test('returns the scroll offset Home was left at', () => {
    window.scrollY = 640
    stageOpenMorph('atlas', coverElement(), 30)
    vi.restoreAllMocks()
    stageCloseMorph('atlas', containerElement(), 60)

    expect(readCloseMorph().homeScroll).toBe(640)
  })
})

describe('baton, either direction', () => {
  test('one direction never answers a read for the other', () => {
    stageCloseMorph('atlas', containerElement(), 60)

    expect(readOpenMorph('atlas')).toBeNull()
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

  test('stages an origin the overlay can spread', () => {
    stageOpenMorph('atlas', coverElement(), 30)
    stageCloseMorph('atlas', containerElement(), 60)

    expect({ ...readCloseMorph() }).toMatchObject({ width: 864, height: 675, radius: 60 })
  })

  test('survives being read twice, as StrictMode will', () => {
    stageOpenMorph('atlas', coverElement(), 30)

    expect(readOpenMorph('atlas')).toEqual(readOpenMorph('atlas'))
  })
})

describe.each([
  ['open', CASE_STUDY_LAYOUT.compact.openMorph],
  ['close', CASE_STUDY_LAYOUT.compact.closeMorph],
])('%s morph timeline', (_name, cfg) => {
  const timeline = buildMorphTimeline(cfg)

  test('uncovers the destination just before the proxy lands on it', () => {
    expect(timeline.revealAtMs).toBe(timeline.flightMs - cfg.revealLeadMs)
    expect(timeline.revealAtMs).toBeLessThan(timeline.flightMs)
  })

  test('never fades the proxy before it has arrived', () => {
    // Once the artwork has finished crossing, the proxy and the thing beneath
    // it differ only in geometry, so going translucent early doubles the edge.
    expect(timeline.proxyFadeDelayS * 1000).toBeGreaterThanOrEqual(timeline.flightMs)
  })

  test('finishes the artwork crossing before the proxy starts fading', () => {
    const crossingEndsMs = (timeline.artworkFadeDelayS + cfg.artworkFadeDuration) * 1000

    expect(crossingEndsMs).toBeLessThanOrEqual(timeline.proxyFadeDelayS * 1000)
  })

  test('holds the overlay until its own fade is finished', () => {
    expect(timeline.totalMs).toBe(timeline.proxyFadeDelayS * 1000 + timeline.proxyFadeMs)
  })
})

describe('open morph timeline', () => {
  const cfg = CASE_STUDY_LAYOUT.compact.openMorph
  const timeline = buildMorphTimeline(cfg)

  test('dissolves the artwork in the first half, not on the doorstep', () => {
    // The card should read as the container for most of its travel. Landing
    // the dissolve at arrival — which merely satisfies "before the proxy
    // fades" — is the drift this guards against.
    const dissolveEndsMs = (timeline.artworkFadeDelayS + cfg.artworkFadeDuration) * 1000

    expect(dissolveEndsMs).toBeLessThan(timeline.flightMs * 0.7)
  })
})

describe('close morph timeline', () => {
  const cfg = CASE_STUDY_LAYOUT.compact.closeMorph
  const timeline = buildMorphTimeline(cfg)

  test('resolves the artwork late, mirroring the outbound dissolve', () => {
    // Coming back, the card should stay the container most of the way down and
    // only become the cover as it arrives.
    expect(timeline.artworkFadeDelayS * 1000).toBeGreaterThan(timeline.flightMs * 0.35)
  })
})
