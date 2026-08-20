import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import CaseStudyCover from '../components/CaseStudyCover'

/**
 * CaseStudyCover behaviour.
 *
 * The design here is that the image is always present and the video is only
 * ever an overlay that has to earn its opacity, so these tests are mostly
 * about what *doesn't* happen: no video without capability, no video off
 * screen, no visible video until it actually plays, and no broken state when
 * playback fails.
 */

const { hlsInstances } = vi.hoisted(() => ({ hlsInstances: [] }))

vi.mock('hls.js/light', () => {
  class MockHls {
    static isSupported = () => true
    static Events = { ERROR: 'hlsError', MANIFEST_PARSED: 'hlsManifestParsed' }

    constructor(config) {
      this.config = config
      this.handlers = {}
      this.destroyed = false
      hlsInstances.push(this)
    }

    on(event, handler) {
      this.handlers[event] = handler
    }

    loadSource(url) {
      this.source = url
    }

    attachMedia(element) {
      this.media = element
    }

    destroy() {
      this.destroyed = true
    }
  }

  return { default: MockHls }
})

const COVER_IMAGE = {
  _type: 'image',
  asset: { _ref: 'image-abc123-1920x1080-jpg', _type: 'reference' },
}
const COVER_VIDEO = { playbackId: 'pb-123', status: 'preparing' }

let observers = []
let prefersReducedMotion = false

/** Fire the IntersectionObserver callback for every mounted cover. */
function scrollIntoView() {
  act(() => {
    observers.forEach((observer) => observer.callback([{ isIntersecting: true }], observer))
  })
}

/** Let the dynamic import of the player resolve. */
async function settle() {
  await act(async () => {})
}

function renderCover(props = {}) {
  return render(
    <CaseStudyCover
      coverImage={COVER_IMAGE}
      coverVideo={COVER_VIDEO}
      alt="Project cover"
      sizes="440px"
      maxWidth={880}
      {...props}
    />
  )
}

beforeAll(() => {
  // jsdom implements neither, and both throw "not implemented" if called.
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
  HTMLMediaElement.prototype.load = vi.fn()

  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback
      observers.push(this)
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

beforeEach(() => {
  observers = []
  hlsInstances.length = 0
  prefersReducedMotion = false

  // jsdom ships no MediaSource, which would make every test look like iOS.
  // Default to a Chromium-shaped environment; the native suite clears it.
  vi.stubGlobal('MediaSource', class MockMediaSource {})

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query.includes('prefers-reduced-motion') ? prefersReducedMotion : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})

describe('the image underneath', () => {
  test('renders even before anything is in view', () => {
    renderCover()
    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
  })

  test('stays mounted once the video is playing', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    fireEvent(container.querySelector('video'), new Event('playing'))

    // The image is the fallback and the LCP element — it is never swapped out.
    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
  })

  test('is all there is when no video is provided', () => {
    const { container } = renderCover({ coverVideo: null })
    scrollIntoView()

    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
    expect(container.querySelector('video')).toBeNull()
  })
})

describe('when the video loads', () => {
  test('waits for the element to scroll into view', async () => {
    const { container } = renderCover()

    expect(container.querySelector('video')).toBeNull()
    expect(hlsInstances).toHaveLength(0)

    scrollIntoView()
    await settle()

    expect(container.querySelector('video')).toBeInTheDocument()
    expect(hlsInstances).toHaveLength(1)
  })

  test('does not load under prefers-reduced-motion', async () => {
    prefersReducedMotion = true

    const { container } = renderCover()
    scrollIntoView()
    await settle()

    expect(container.querySelector('video')).toBeNull()
    expect(hlsInstances).toHaveLength(0)
  })

  test('loads despite a stale non-ready status from Sanity', async () => {
    const { container } = renderCover({ coverVideo: { playbackId: 'pb-123', status: 'preparing' } })
    scrollIntoView()
    await settle()

    expect(container.querySelector('video')).toBeInTheDocument()
    expect(hlsInstances[0].source).toContain('pb-123')
  })

  test('requests a resolution-capped HLS stream', async () => {
    renderCover()
    scrollIntoView()
    await settle()

    expect(hlsInstances[0].source).toBe(
      'https://stream.mux.com/pb-123.m3u8?max_resolution=720p'
    )
  })
})

describe('revealing the video', () => {
  test('stays transparent until playback actually starts', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    const video = container.querySelector('video')
    expect(video).toHaveStyle({ opacity: '0' })

    fireEvent(video, new Event('playing'))

    await waitFor(() => expect(video).toHaveStyle({ opacity: '1' }))
  })

  test('is hidden from assistive tech and the tab order', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    const video = container.querySelector('video')
    expect(video).toHaveAttribute('aria-hidden', 'true')
    expect(video).toHaveAttribute('tabindex', '-1')
    expect(video.muted).toBe(true)
  })
})

describe('when playback fails', () => {
  test('a fatal HLS error falls back to the image silently', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    const hls = hlsInstances[0]
    act(() => hls.handlers.hlsError(null, { fatal: true }))

    expect(container.querySelector('video')).toBeNull()
    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
    expect(hls.destroyed).toBe(true)
  })

  test('a non-fatal HLS error is ignored', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    act(() => hlsInstances[0].handlers.hlsError(null, { fatal: false }))

    expect(container.querySelector('video')).toBeInTheDocument()
  })

  test('a media element error falls back to the image', async () => {
    const { container } = renderCover()
    scrollIntoView()
    await settle()

    fireEvent(container.querySelector('video'), new Event('error'))

    expect(container.querySelector('video')).toBeNull()
    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
  })
})

describe('choosing a playback path', () => {
  let canPlayType

  beforeEach(() => {
    canPlayType = vi.spyOn(HTMLMediaElement.prototype, 'canPlayType')
  })

  afterEach(() => {
    canPlayType.mockRestore()
  })

  test('iOS plays natively and never downloads the player', async () => {
    // No MediaSource, but real HLS in the platform.
    vi.stubGlobal('MediaSource', undefined)
    canPlayType.mockReturnValue('probably')

    const { container } = renderCover()
    scrollIntoView()
    await settle()

    expect(hlsInstances).toHaveLength(0)
    expect(container.querySelector('video').src).toBe(
      'https://stream.mux.com/pb-123.m3u8?max_resolution=720p'
    )
  })

  test('ignores a "maybe" from a browser that has MediaSource', async () => {
    // Chrome answers "maybe" for the HLS MIME type on some builds while having
    // no demuxer for it. Trusting that sets a src which can never decode, and
    // the resulting error event retires the video permanently — the exact bug
    // that made every cover fall back to its still image.
    canPlayType.mockReturnValue('maybe')

    const { container } = renderCover()
    scrollIntoView()
    await settle()

    expect(hlsInstances).toHaveLength(1)
    expect(hlsInstances[0].media).toBe(container.querySelector('video'))
    expect(container.querySelector('video').src).toBe('')
  })

  test('falls back to native when MediaSource exists but hls.js declines it', async () => {
    const { default: MockHls } = await import('hls.js/light')
    const isSupported = vi.spyOn(MockHls, 'isSupported').mockReturnValue(false)
    canPlayType.mockReturnValue('probably')

    const { container } = renderCover()
    scrollIntoView()
    await settle()

    expect(hlsInstances).toHaveLength(0)
    expect(container.querySelector('video').src).toBe(
      'https://stream.mux.com/pb-123.m3u8?max_resolution=720p'
    )

    isSupported.mockRestore()
  })

  test('gives up and keeps the image when nothing can play HLS', async () => {
    vi.stubGlobal('MediaSource', undefined)
    canPlayType.mockReturnValue('')

    const { container } = renderCover()
    scrollIntoView()
    await settle()

    expect(hlsInstances).toHaveLength(0)
    expect(container.querySelector('video')).toBeNull()
    expect(screen.getByAltText('Project cover')).toBeInTheDocument()
  })
})
