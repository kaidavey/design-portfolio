import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// Sanity client configuration
export const client = createClient({
  projectId: '6vslo6fw',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-08-15', // Use current API version
})

// Image URL builder
const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

/**
 * Is this asset an SVG? Sanity does not rasterise SVG — a `?w=` on one returns
 * the same bytes — so callers serve it a single plain `src`.
 *
 * A dereferenced asset carries `extension`; a raw reference carries only
 * `_ref`, and Sanity ends every image id with its extension.
 */
export function isSvgAsset(source) {
  const asset = source?.asset
  if (!asset) return false
  if (asset.extension === 'svg') return true
  return Boolean((asset._id || asset._ref)?.endsWith('-svg'))
}
