import { useEffect, useState } from 'react'
import { getAllCaseStudies, getCaseStudyBySlug, getCachedCaseStudy, setCachedCaseStudy, prefetchCaseStudy } from '../lib/queries'

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

// Hook to fetch a single case study by slug with caching
export function useCaseStudy(slug) {
  const [caseStudy, setCaseStudy] = useState(() => getCachedCaseStudy(slug))
  const [loading, setLoading] = useState(!getCachedCaseStudy(slug))
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check cache first
    const cached = getCachedCaseStudy(slug)
    if (cached) {
      setCaseStudy(cached)
      setLoading(false)
      return
    }

    async function loadCaseStudy() {
      try {
        setLoading(true)
        const data = await getCaseStudyBySlug(slug)

        if (!data) {
          setError('Case study not found')
          return
        }

        setCachedCaseStudy(slug, data)
        setCaseStudy(data)
      } catch (err) {
        console.error('Error loading case study:', err)
        setError('Failed to load case study')
      } finally {
        setLoading(false)
      }
    }

    loadCaseStudy()
  }, [slug])

  return { caseStudy, loading, error }
}

// Hook to get neighbors and prefetch them
export function useNeighborPrefetch(slug, caseStudies) {
  useEffect(() => {
    if (!slug || !caseStudies.length) return

    const currentIndex = caseStudies.findIndex((cs) => cs.slug.current === slug)
    if (currentIndex === -1) return

    // Prefetch previous
    if (currentIndex > 0) {
      const prevSlug = caseStudies[currentIndex - 1].slug.current
      prefetchCaseStudy(prevSlug)
    }

    // Prefetch next
    if (currentIndex < caseStudies.length - 1) {
      const nextSlug = caseStudies[currentIndex + 1].slug.current
      prefetchCaseStudy(nextSlug)
    }
  }, [slug, caseStudies])
}
