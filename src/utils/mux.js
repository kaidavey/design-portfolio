/**
 * Mux Video Utilities
 *
 * Converts the Mux asset data Sanity gives us into playback URLs.
 */

/**
 * Flattens the two shapes a Mux asset reaches us in.
 *
 * GROQ can hand back either `{ asset: {...} }` (when the projection keeps the
 * wrapper) or the asset document itself (when it dereferences straight into a
 * key). Callers shouldn't have to know which one they got.
 *
 * @param {Object} input - Sanity Mux video object, or the asset document
 * @returns {{playbackId: string, status: string|null}|null}
 */
export function normalizeMuxAsset(input) {
  if (!input) return null

  const asset = input.asset ?? input

  // A reference that was never dereferenced — the query is missing an `->`.
  if (asset?._ref) return null

  const playbackId = asset?.playbackId ?? asset?.data?.playback_ids?.[0]?.id
  if (!playbackId) return null

  // `status` is a snapshot the Studio takes moments after Mux ingests the file,
  // while the asset is still encoding, and nothing routinely writes it back —
  // so it reads "preparing" long after playback works. Carry it for debugging,
  // but never gate playback on it. The playback ID is the durable signal.
  return { playbackId, status: asset?.status ?? null }
}

/**
 * Builds an HLS playback URL for a Mux asset.
 *
 * Returns null when there's nothing playable, which callers treat as "show the
 * image instead".
 *
 * @param {Object} input - Sanity Mux video object, or the asset document
 * @param {Object} options
 * @param {string|null} options.maxResolution - Cap delivered resolution ('720p' by default)
 * @returns {string|null}
 */
export function getMuxPlaybackUrl(input, { maxResolution = '720p' } = {}) {
  const asset = normalizeMuxAsset(input)
  if (!asset) return null

  const query = maxResolution ? `?max_resolution=${maxResolution}` : ''
  return `https://stream.mux.com/${asset.playbackId}.m3u8${query}`
}
