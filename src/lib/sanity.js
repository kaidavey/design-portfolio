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
 * Is this asset an SVG?
 *
 * Sanity's image pipeline does not rasterise SVG — a `?w=` on one comes back as
 * the same bytes it went in as. So a five-candidate srcset for an SVG is five
 * URLs for one file: no sharper at any width, and five chances to miss the
 * cache. Callers use this to emit a single plain `src` instead.
 *
 * Reads whichever identity the projection happens to carry. A dereferenced
 * asset has `extension` and `mimeType`; a raw reference has only `_ref`, and
 * Sanity ends every image id with its extension.
 */
export function isSvgAsset(source) {
  const asset = source?.asset
  if (!asset) return false
  if (asset.extension === 'svg' || asset.mimeType === 'image/svg+xml') return true

  const id = asset._id || asset._ref
  return typeof id === 'string' && id.endsWith('-svg')
}
