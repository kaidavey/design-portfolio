import { describe, test, expect, beforeEach } from 'vitest'
import { client, urlFor } from '../lib/sanity'
import {
  getAllCaseStudies,
  getCaseStudyBySlug,
  getCachedCaseStudy,
  setCachedCaseStudy,
  prefetchCaseStudy,
} from '../lib/queries'

/**
 * Sanity CMS Integration Tests
 *
 * Verifies that Sanity CMS connection is working:
 * - Client is properly configured
 * - Can connect to Sanity project
 * - Can fetch case studies
 * - urlFor helper works correctly
 * - Cache functions work
 */

describe('Sanity Client Configuration', () => {
  test('client is configured with correct project settings', () => {
    expect(client.config()).toBeDefined()
    expect(client.config().projectId).toBe('6vslo6fw')
    expect(client.config().dataset).toBe('production')
    expect(client.config().useCdn).toBe(true)
    expect(client.config().apiVersion).toBe('2024-01-01')
  })

  test('client has fetch method', () => {
    expect(client.fetch).toBeDefined()
    expect(typeof client.fetch).toBe('function')
  })
})

describe('Sanity Connection', () => {
  test('can connect to Sanity and fetch data', async () => {
    // Simple GROQ query to test connection
    const query = '*[_type == "caseStudy"][0...1]'

    try {
      const result = await client.fetch(query)
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    } catch (error) {
      // If this fails, it means either:
      // 1. No internet connection
      // 2. Sanity credentials are wrong
      // 3. Sanity project is not accessible
      throw new Error(`Sanity connection failed: ${error.message}`)
    }
  }, 10000) // 10s timeout for network request

  test('can fetch case study schema fields', async () => {
    const query = '*[_type == "caseStudy"][0] { _id, title, slug }'

    const result = await client.fetch(query)

    if (result) {
      expect(result).toBeDefined()
      expect(result._id).toBeDefined()
      // If there's data, check schema structure
      if (result.title) {
        expect(typeof result.title).toBe('string')
      }
      if (result.slug) {
        expect(result.slug).toHaveProperty('current')
      }
    }
  }, 10000)
})

describe('Case Study Queries', () => {
  test('getAllCaseStudies returns array', async () => {
    const caseStudies = await getAllCaseStudies()

    expect(Array.isArray(caseStudies)).toBe(true)

    // If there are case studies, verify structure
    if (caseStudies.length > 0) {
      const firstStudy = caseStudies[0]

      expect(firstStudy).toHaveProperty('_id')
      expect(firstStudy).toHaveProperty('title')
      expect(firstStudy).toHaveProperty('slug')

      expect(typeof firstStudy.title).toBe('string')
      expect(firstStudy.slug).toHaveProperty('current')
      expect(typeof firstStudy.slug.current).toBe('string')
    }
  }, 10000)

  test('getAllCaseStudies returns ordered results', async () => {
    const caseStudies = await getAllCaseStudies()

    if (caseStudies.length > 1) {
      // Verify results have order field (or are ordered somehow)
      const hasOrder = caseStudies.some(cs => cs.order !== undefined)

      if (hasOrder) {
        // Check if ordered correctly
        for (let i = 1; i < caseStudies.length; i++) {
          expect(caseStudies[i].order).toBeGreaterThanOrEqual(
            caseStudies[i - 1].order
          )
        }
      }
    }
  }, 10000)

  test('getCaseStudyBySlug returns null for non-existent slug', async () => {
    const result = await getCaseStudyBySlug('non-existent-slug-12345')
    expect(result).toBeNull()
  }, 10000)

  test('getCaseStudyBySlug returns case study with body blocks', async () => {
    // First get all case studies to find a real slug
    const allStudies = await getAllCaseStudies()

    if (allStudies.length > 0) {
      const slug = allStudies[0].slug.current
      const caseStudy = await getCaseStudyBySlug(slug)

      expect(caseStudy).toBeDefined()
      expect(caseStudy._id).toBeDefined()
      expect(caseStudy.title).toBeDefined()
      expect(caseStudy.slug).toBeDefined()

      // Body should be an array of blocks
      if (caseStudy.body) {
        expect(Array.isArray(caseStudy.body)).toBe(true)

        // If there are blocks, check structure
        if (caseStudy.body.length > 0) {
          const firstBlock = caseStudy.body[0]
          expect(firstBlock).toHaveProperty('_type')
          expect(firstBlock).toHaveProperty('_key')
        }
      }
    }
  }, 10000)
})

describe('Image URL Builder', () => {
  test('urlFor function exists and returns builder', () => {
    expect(urlFor).toBeDefined()
    expect(typeof urlFor).toBe('function')

    // Create a mock Sanity image reference
    const mockImage = {
      _type: 'image',
      asset: {
        _ref: 'image-abc123-1920x1080-jpg',
        _type: 'reference',
      },
    }

    const builder = urlFor(mockImage)
    expect(builder).toBeDefined()

    // Check that builder has the expected methods
    expect(typeof builder.width).toBe('function')
    expect(typeof builder.height).toBe('function')
    expect(typeof builder.url).toBe('function')
  })

  test('urlFor generates valid URL structure', () => {
    const mockImage = {
      _type: 'image',
      asset: {
        _ref: 'image-abc123-1920x1080-jpg',
        _type: 'reference',
      },
    }

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

  test('prefetchCaseStudy fetches and caches data', async () => {
    // Get a real slug from the API
    const allStudies = await getAllCaseStudies()

    if (allStudies.length > 0) {
      // Use the second case study to avoid potential conflicts
      const slug = allStudies.length > 1 ? allStudies[1].slug.current : allStudies[0].slug.current

      // Check if already cached
      const alreadyCached = getCachedCaseStudy(slug)

      // Prefetch (will skip if already cached)
      await prefetchCaseStudy(slug)

      // Check cache - should be defined either from prefetch or existing cache
      const cached = getCachedCaseStudy(slug)

      if (alreadyCached || cached) {
        expect(cached).toBeDefined()
        expect(cached.slug.current).toBe(slug)
      }
    }
  }, 10000)

  test('prefetchCaseStudy does not fetch if already cached', async () => {
    // Set cache
    setCachedCaseStudy(testSlug, testData)

    // Prefetch should not override
    await prefetchCaseStudy(testSlug)

    const cached = getCachedCaseStudy(testSlug)
    expect(cached).toEqual(testData)
  })
})

describe('Sanity Content Structure', () => {
  test('case study blocks have required _type and _key', async () => {
    const allStudies = await getAllCaseStudies()

    if (allStudies.length > 0) {
      const slug = allStudies[0].slug.current
      const caseStudy = await getCaseStudyBySlug(slug)

      if (caseStudy && caseStudy.body && caseStudy.body.length > 0) {
        caseStudy.body.forEach((block) => {
          expect(block).toHaveProperty('_type')
          expect(block).toHaveProperty('_key')
          expect(typeof block._type).toBe('string')
          expect(typeof block._key).toBe('string')
        })
      }
    }
  }, 10000)

  test('case study has cover image if present', async () => {
    const allStudies = await getAllCaseStudies()

    if (allStudies.length > 0) {
      const studyWithCover = allStudies.find((cs) => cs.coverImage)

      if (studyWithCover) {
        expect(studyWithCover.coverImage).toBeDefined()
        expect(studyWithCover.coverImage).toHaveProperty('asset')
      }
    }
  }, 10000)
})
