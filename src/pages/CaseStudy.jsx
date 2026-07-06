import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCaseStudyBySlug } from '../lib/queries'
import BlockRenderer from '../components/BlockRenderer'
import { urlFor } from '../lib/sanity'

export default function CaseStudy() {
  const { slug } = useParams()
  const [caseStudy, setCaseStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCaseStudy() {
      try {
        setLoading(true)
        const data = await getCaseStudyBySlug(slug)

        if (!data) {
          setError('Case study not found')
          return
        }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!caseStudy) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {caseStudy.coverImage && (
        <div className="w-full h-96 mb-16">
          <img
            src={urlFor(caseStudy.coverImage).width(1440).height(600).url()}
            alt={caseStudy.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-[770px] mx-auto px-6 pb-24">
        {/* Case Study Body - Rendered with BlockRenderer */}
        <BlockRenderer blocks={caseStudy.body} />
      </div>
    </div>
  )
}
