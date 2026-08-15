import { useEffect, useState } from 'react'
import { getAllCaseStudies, getCaseStudyBySlug, getCaseStudyShape, getCachedCaseStudy, getCachedShape, setCachedCaseStudy, setCachedShape, prefetchCaseStudy } from '../lib/queries'

// Hook to fetch all case studies (ordered list)
export function useCaseStudies() {
  const [caseStudies, setCaseStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCaseStudies() {
      try {
        setLoading(true)
        const data = await getAllCaseStudies()
        setCaseStudies(data || [])
      } catch (err) {
        console.error('Error loading case studies:', err)
        setError('Failed to load case studies')
      } finally {
        setLoading(false)
      }
    }

    loadCaseStudies()
  }, [])

  return { caseStudies, loading, error }
}

// Hook to fetch a single case study by slug with caching and shape support
export function useCaseStudy(slug) {
  const [caseStudy, setCaseStudy] = useState(() => getCachedCaseStudy(slug))
  const [shape, setShape] = useState(() => getCachedShape(slug))
  const [loading, setLoading] = useState(!getCachedCaseStudy(slug))
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check body cache first
    const cachedBody = getCachedCaseStudy(slug)
    const cachedShape = getCachedShape(slug)

    console.log('[useCaseStudy]', slug, {
      hasCachedBody: !!cachedBody,
      hasCachedShape: !!cachedShape,
    })

    if (cachedBody) {
      setCaseStudy(cachedBody)
      setShape(cachedShape)
      setLoading(false)
      return
    }

    // On cache miss, fire both requests in parallel
    async function loadCaseStudyData() {
      try {
        setLoading(true)
        console.log('[useCaseStudy] Cache miss, fetching shape + body for', slug)

        // Fire both requests without await between them
        const bodyPromise = getCaseStudyBySlug(slug)
        const shapePromise = getCaseStudyShape(slug)

        // Track which resolves first
        shapePromise.then(() => console.log('[useCaseStudy] Shape resolved first'))
        bodyPromise.then(() => console.log('[useCaseStudy] Body resolved'))

        // Wait for both
        const [bodyData, shapeData] = await Promise.all([bodyPromise, shapePromise])

        console.log('[useCaseStudy] Both resolved', {
          hasBody: !!bodyData,
          hasShape: !!shapeData,
          blockCount: shapeData?.blockTypes?.length,
        })

        // Guard against stale responses after navigation
        if (slug !== bodyData?.slug?.current) return

        if (!bodyData) {
          setError('Case study not found')
          return
        }

        setCachedCaseStudy(slug, bodyData)
        setCaseStudy(bodyData)

        if (shapeData) {
          setCachedShape(slug, shapeData)
          setShape(shapeData)
        }
      } catch (err) {
        console.error('Error loading case study:', err)
        setError('Failed to load case study')
      } finally {
        setLoading(false)
      }
    }

    loadCaseStudyData()
  }, [slug])

  return { caseStudy, shape, loading, error }
}

// Hook to prefetch neighbor case studies
export function useNeighborPrefetch(prevSlug, nextSlug) {
  useEffect(() => {
    if (prevSlug) {
      prefetchCaseStudy(prevSlug)
    }
    if (nextSlug) {
      prefetchCaseStudy(nextSlug)
    }
  }, [prevSlug, nextSlug])
}
