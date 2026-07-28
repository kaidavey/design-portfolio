import { useState } from 'react'
import { X } from 'lucide-react'
import { useCaseStudy } from '../hooks/useCaseStudies'
import { urlFor } from '../lib/sanity'
import BlockRenderer from './BlockRenderer'

export default function CaseStudyBody({ slug, expandButton }) {
  const { caseStudy, loading, error } = useCaseStudy(slug)
  const [showViewSolution, setShowViewSolution] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!caseStudy) {
    return null
  }

  const hasMetadata = caseStudy.role || caseStudy.timeline || caseStudy.team || caseStudy.tools

  return (
    <div className="space-y-8px">
      <BlockRenderer blocks={caseStudy.body} expandButton={expandButton} />
    </div>
  )
}
