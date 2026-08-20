import { describe, test, expect } from 'vitest'
import { client, urlFor } from '../lib/sanity'
import {
  getCachedCaseStudy,
  setCachedCaseStudy,
  prefetchCaseStudy,
} from '../lib/queries'

/**
 * Offline Sanity tests — client wiring, URL building and the prefetch cache.
 *
 * Anything that actually talks to the Sanity API lives in
 * `sanity.integration.test.js`, which is skipped unless you opt in. Keeping
 * network out of the default suite means `npm test` passes on a plane and in
 * CI, and a red run means a real regression rather than a flaky DNS lookup.
 */

describe('Sanity Client Configuration', () => {
  test('client is configured with correct project settings', () => {
    expect(client.config()).toBeDefined()
    expect(client.config().projectId).toBe('6vslo6fw')
    expect(client.config().dataset).toBe('production')
    expect(client.config().useCdn).toBe(true)
    expect(client.config().apiVersion).toBe('2025-08-15')
  })

  test('client has fetch method', () => {
    expect(client.fetch).toBeDefined()
    expect(typeof client.fetch).toBe('function')
  })
})

describe('Image URL Builder', () => {
  const mockImage = {
    _type: 'image',
    asset: {
      _ref: 'image-abc123-1920x1080-jpg',
      _type: 'reference',
    },
  }

  test('urlFor function exists and returns builder', () => {
    expect(urlFor).toBeDefined()
    expect(typeof urlFor).toBe('function')

    const builder = urlFor(mockImage)
    expect(builder).toBeDefined()
    expect(typeof builder.width).toBe('function')
    expect(typeof builder.height).toBe('function')
    expect(typeof builder.url).toBe('function')
  })

  test('urlFor generates valid URL structure', () => {
    const url = urlFor(mockImage).width(800).url()

    expect(typeof url).toBe('string')
    expect(url).toContain('cdn.sanity.io')
    expect(url).toContain('6vslo6fw') // Project ID
  })
})

describe('Case Study Cache', () => {
  const testSlug = 'test-case-study'
  const testData = {
    _id: 'test-id',
    title: 'Test Case Study',
    slug: { current: testSlug },
    body: [],
  }

  test('setCachedCaseStudy stores data', () => {
    setCachedCaseStudy(testSlug, testData)
    const cached = getCachedCaseStudy(testSlug)

    expect(cached).toBeDefined()
    expect(cached).toEqual(testData)
  })

  test('getCachedCaseStudy returns undefined for non-cached slug', () => {
    const cached = getCachedCaseStudy('non-existent-cache-key')
    expect(cached).toBeUndefined()
  })

  test('prefetchCaseStudy does not fetch if already cached', async () => {
    setCachedCaseStudy(testSlug, testData)

    // Already cached, so this must not reach the network.
    await prefetchCaseStudy(testSlug)

    expect(getCachedCaseStudy(testSlug)).toEqual(testData)
  })
})
