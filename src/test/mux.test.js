import { describe, it, expect } from 'vitest'
import { normalizeMuxAsset, getMuxPlaybackUrl } from '../utils/mux'

const PLAYBACK_ID = 'V01u029lnS8qi9h501vMYtPIrZpEyZkFBEJyf02yUhsfaMc'

describe('normalizeMuxAsset', () => {
  it('reads a flat asset document', () => {
    expect(normalizeMuxAsset({ playbackId: PLAYBACK_ID, status: 'ready' })).toEqual({
      playbackId: PLAYBACK_ID,
      status: 'ready',
    })
  })

  it('reads an asset still wrapped in its field', () => {
    expect(
      normalizeMuxAsset({ asset: { playbackId: PLAYBACK_ID, status: 'ready' } })
    ).toEqual({ playbackId: PLAYBACK_ID, status: 'ready' })
  })

  it('treats both query shapes identically', () => {
    const flat = normalizeMuxAsset({ playbackId: PLAYBACK_ID, status: 'preparing' })
    const wrapped = normalizeMuxAsset({
      asset: { playbackId: PLAYBACK_ID, status: 'preparing' },
    })
    expect(flat).toEqual(wrapped)
  })

  it('falls back to the playback ID nested in the raw Mux payload', () => {
    expect(
      normalizeMuxAsset({ data: { playback_ids: [{ id: PLAYBACK_ID }] } })
    ).toEqual({ playbackId: PLAYBACK_ID, status: null })
  })

  it('returns null for a reference the query never dereferenced', () => {
    expect(normalizeMuxAsset({ asset: { _ref: 'abc-123', _type: 'reference' } })).toBeNull()
  })

  it('returns null when there is no playback ID', () => {
    expect(normalizeMuxAsset({ status: 'preparing' })).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(normalizeMuxAsset(null)).toBeNull()
    expect(normalizeMuxAsset(undefined)).toBeNull()
  })
})

describe('getMuxPlaybackUrl', () => {
  it('builds an HLS URL capped at 720p by default', () => {
    expect(getMuxPlaybackUrl({ playbackId: PLAYBACK_ID, status: 'ready' })).toBe(
      `https://stream.mux.com/${PLAYBACK_ID}.m3u8?max_resolution=720p`
    )
  })

  it('honours an explicit resolution cap', () => {
    expect(
      getMuxPlaybackUrl({ playbackId: PLAYBACK_ID }, { maxResolution: '1080p' })
    ).toContain('max_resolution=1080p')
  })

  it('omits the cap when asked for none', () => {
    expect(getMuxPlaybackUrl({ playbackId: PLAYBACK_ID }, { maxResolution: null })).toBe(
      `https://stream.mux.com/${PLAYBACK_ID}.m3u8`
    )
  })

  // Regression: the Studio writes `status` once, moments after Mux ingests the
  // file and long before encoding finishes, and nothing routinely updates it.
  // Gating on it meant every cover video silently fell back to its image.
  it('still returns a URL when Sanity reports a stale non-ready status', () => {
    expect(getMuxPlaybackUrl({ playbackId: PLAYBACK_ID, status: 'preparing' })).toBe(
      `https://stream.mux.com/${PLAYBACK_ID}.m3u8?max_resolution=720p`
    )
  })

  it('returns null when there is nothing playable', () => {
    expect(getMuxPlaybackUrl(null)).toBeNull()
    expect(getMuxPlaybackUrl({ status: 'ready' })).toBeNull()
    expect(getMuxPlaybackUrl({ asset: { _ref: 'abc-123' } })).toBeNull()
  })
})
