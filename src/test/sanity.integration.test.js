import { describe, test, expect } from 'vitest'
import { client } from '../lib/sanity'
import {
  getAllCaseStudies,
  getCaseStudyBySlug,
  getCachedCaseStudy,
  prefetchCaseStudy,
} from '../lib/queries'

/**
 * Sanity integration tests — these hit the live API.
 *
 * Skipped unless SANITY_INTEGRATION is set, so `npm test` stays offline and
 * deterministic. Run them with `npm run test:integration` when you want to
 * check the real dataset (after a schema change, or when content looks wrong).
 */

const enabled = Boolean(process.env.SANITY_INTEGRATION)
const suite = describe.skipIf(!enabled)

suite('Sanity Connection', () => {
  test('can connect to Sanity and fetch data', async () => {
    const result = await client.fetch('*[_type == "caseStudy"][0...1]')

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  }, 10000)

  test('can fetch case study schema fields', async () => {
    const result = await client.fetch('*[_type == "caseStudy"][0] { _id, title, slug }')

    if (result) {
      expect(result._id).toBeDefined()
      if (result.title) expect(typeof result.title).toBe('string')
      if (result.slug) expect(result.slug).toHaveProperty('current')
    }
  }, 10000)
})

suite('Case Study Queries', () => {
  test('getAllCaseStudies returns array', async () => {
    const caseStudies = await getAllCaseStudies()

    expect(Array.isArray(caseStudies)).toBe(true)

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

    if (caseStudies.length > 1 && caseStudies.some((cs) => cs.order !== undefined)) {
      for (let i = 1; i < caseStudies.length; i++) {
        expect(caseStudies[i].order).toBeGreaterThanOrEqual(caseStudies[i - 1].order)
      }
    }
  }, 10000)

  test('getCaseStudyBySlug returns null for non-existent slug', async () => {
    expect(await getCaseStudyBySlug('non-existent-slug-12345')).toBeNull()
  }, 10000)

  test('getCaseStudyBySlug returns case study with body blocks', async () => {
    const allStudies = await getAllCaseStudies()
    if (allStudies.length === 0) return

    const caseStudy = await getCaseStudyBySlug(allStudies[0].slug.current)

    expect(caseStudy).toBeDefined()
    expect(caseStudy._id).toBeDefined()
    expect(caseStudy.title).toBeDefined()
    expect(caseStudy.slug).toBeDefined()

    if (caseStudy.body) {
      expect(Array.isArray(caseStudy.body)).toBe(true)

      if (caseStudy.body.length > 0) {
        expect(caseStudy.body[0]).toHaveProperty('_type')
        expect(caseStudy.body[0]).toHaveProperty('_key')
      }
    }
  }, 10000)

  test('prefetchCaseStudy fetches and caches data', async () => {
    const allStudies = await getAllCaseStudies()
    if (allStudies.length === 0) return

    // Use the second case study to avoid clashing with other tests.
    const slug = (allStudies[1] ?? allStudies[0]).slug.current

    await prefetchCaseStudy(slug)

    const cached = getCachedCaseStudy(slug)
    expect(cached).toBeDefined()
    expect(cached.slug.current).toBe(slug)
  }, 10000)
})

suite('Sanity Content Structure', () => {
  test('case study blocks have required _type and _key', async () => {
    const allStudies = await getAllCaseStudies()
    if (allStudies.length === 0) return

    const caseStudy = await getCaseStudyBySlug(allStudies[0].slug.current)

    caseStudy?.body?.forEach((block) => {
      expect(block).toHaveProperty('_type')
      expect(block).toHaveProperty('_key')
      expect(typeof block._type).toBe('string')
      expect(typeof block._key).toBe('string')
    })
  }, 10000)

  test('case study has cover image if present', async () => {
    const allStudies = await getAllCaseStudies()
    const studyWithCover = allStudies.find((cs) => cs.coverImage)

    if (studyWithCover) {
      expect(studyWithCover.coverImage).toHaveProperty('asset')
    }
  }, 10000)

  // The bug this branch fixes: Sanity's `status` is a snapshot taken while the
  // asset was still encoding, so it reads "preparing" indefinitely. A playback
  // ID with a non-ready status alongside it is the normal, healthy state.
  test('cover videos expose a playback ID regardless of status', async () => {
    const allStudies = await getAllCaseStudies()
    const withVideo = allStudies.filter((cs) => cs.coverVideo)

    withVideo.forEach((study) => {
      expect(study.coverVideo.playbackId).toEqual(expect.any(String))
    })
  }, 10000)
})
