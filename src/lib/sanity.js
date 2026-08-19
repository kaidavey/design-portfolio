import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// Sanity client configuration
export const client = createClient({
  projectId: '6vslo6fw',
  dataset: 'production',
  useCdn: false, // Temporarily disabled to bypass cache during development
  apiVersion: '2025-08-15', // Use current API version
})

// Image URL builder
const builder = createImageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
