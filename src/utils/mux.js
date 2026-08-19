/**
 * Mux Video Utilities
 *
 * Handles conversion of Sanity Mux video objects to playback URLs
 */

/**
 * Generates a Mux playback URL from a Sanity Mux video object
 *
 * Sanity's Mux plugin stores video data in this structure:
 * {
 *   asset: {
 *     _type: 'mux.videoAsset',
 *     playbackId: 'abc123...',
 *     status: 'ready',
 *     ...
 *   }
 * }
 *
 * @param {Object} muxVideo - Sanity Mux video object
 * @param {Object} options - Playback options
 * @param {number} options.width - Max width (e.g., 1280)
 * @param {number} options.height - Max height (e.g., 720)
 * @param {number} options.fps - Frames per second (e.g., 30)
 * @param {string} options.fit_mode - How to fit the video ('preserve', 'crop', 'smartcrop', 'pad')
 * @returns {string|null} - Mux playback URL or null if invalid
 */
export function getMuxPlaybackUrl(muxVideo, options = {}) {
  console.log('[getMuxPlaybackUrl] Input:', muxVideo)
  console.log('[getMuxPlaybackUrl] Input type:', typeof muxVideo)
  console.log('[getMuxPlaybackUrl] Input keys:', muxVideo ? Object.keys(muxVideo) : 'null/undefined')

  // Handle different possible structures from Sanity Mux plugin
  let playbackId, status

  // Case 1: Dereferenced asset (asset-> in GROQ)
  if (muxVideo?.asset?.playbackId) {
    console.log('[getMuxPlaybackUrl] Using Case 1: asset.playbackId')
    playbackId = muxVideo.asset.playbackId
    status = muxVideo.asset.status
  }
  // Case 2: Direct asset object (already dereferenced)
  else if (muxVideo?.playbackId) {
    console.log('[getMuxPlaybackUrl] Using Case 2: direct playbackId')
    playbackId = muxVideo.playbackId
    status = muxVideo.status
  }
  // Case 3: Asset is a reference (not dereferenced) - can't use this
  else if (muxVideo?.asset?._ref) {
    console.warn('[getMuxPlaybackUrl] Asset is a reference, not dereferenced. Use asset-> in GROQ query')
    console.warn('[getMuxPlaybackUrl] Reference ID:', muxVideo.asset._ref)
    return null
  }
  else {
    console.warn('[getMuxPlaybackUrl] Invalid Mux video object - no playbackId found')
    console.warn('[getMuxPlaybackUrl] muxVideo:', muxVideo)
    return null
  }

  // Check if video is ready
  if (status !== 'ready') {
    console.warn('[getMuxPlaybackUrl] Mux video not ready. Status:', status)
    return null
  }

  if (!playbackId) {
    console.warn('[getMuxPlaybackUrl] No playback ID found')
    return null
  }

  // Build HLS streaming URL (m3u8 format)
  // This is the recommended format for Mux - works with all videos and provides adaptive streaming
  let url = `https://stream.mux.com/${playbackId}.m3u8`
  console.log('[getMuxPlaybackUrl] Generated HLS URL:', url)

  return url
}

/**
 * Generates a Mux thumbnail URL from a Sanity Mux video object
 *
 * @param {Object} muxVideo - Sanity Mux video object
 * @param {Object} options - Thumbnail options
 * @param {number} options.time - Timestamp in seconds (e.g., 1.5)
 * @param {number} options.width - Width in pixels
 * @param {number} options.height - Height in pixels
 * @param {string} options.fit_mode - How to fit the image ('preserve', 'crop', 'smartcrop', 'pad')
 * @returns {string|null} - Mux thumbnail URL or null if invalid
 */
export function getMuxThumbnailUrl(muxVideo, options = {}) {
  if (!muxVideo?.asset?.playbackId) {
    return null
  }

  const { playbackId } = muxVideo.asset
  let url = `https://image.mux.com/${playbackId}/thumbnail.jpg`

  const params = new URLSearchParams()

  if (options.time) params.append('time', options.time)
  if (options.width) params.append('width', options.width)
  if (options.height) params.append('height', options.height)
  if (options.fit_mode) params.append('fit_mode', options.fit_mode)

  const queryString = params.toString()
  if (queryString) {
    url += `?${queryString}`
  }

  return url
}

/**
 * Check if a Mux video is ready for playback
 *
 * @param {Object} muxVideo - Sanity Mux video object
 * @returns {boolean} - True if ready for playback
 */
export function isMuxVideoReady(muxVideo) {
  return muxVideo?.asset?.status === 'ready' && Boolean(muxVideo?.asset?.playbackId)
}
