import { useEffect } from 'react'
import { useCaseStudy } from '../hooks/useCaseStudies'
import { useDelayedLoading } from '../hooks/useDelayedLoading'
import { BlockEntranceProvider } from '../context/BlockEntranceContext'
import { urlFor } from '../lib/sanity'
import BlockRenderer from './BlockRenderer'
import CaseStudySkeleton from './CaseStudySkeleton'

export default function CaseStudyBody({ slug, expandButton, instant = false }) {
  const { caseStudy, shape, loading, error } = useCaseStudy(slug)

  const showSkeleton = useDelayedLoading(loading) && shape != null

  // Debug logging
  useEffect(() => {
    console.log('[CaseStudyBody]', {
      slug,
      loading,
      hasShape: !!shape,
      hasCaseStudy: !!caseStudy,
      showSkeleton,
    })
  }, [slug, loading, shape, caseStudy, showSkeleton])

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  // Show skeleton if delayed loading is active and shape data is available
  if (showSkeleton) {
    console.log('[CaseStudyBody] Rendering skeleton with', shape.blockTypes?.length, 'blocks')
    return (
      <div className="space-y-8">
        <CaseStudySkeleton blockTypes={shape.blockTypes} />
      </div>
    )
  }

  // Show nothing while loading but before delay threshold or while shape is loading
  if (loading) {
    return null
  }

  if (!caseStudy) {
    return null
  }

  const hasMetadata = caseStudy.role || caseStudy.timeline || caseStudy.team || caseStudy.tools

  return (
    <div className="space-y-8">
      {/* Blocks animate in with blur effect when replacing skeleton.
          NOTE: this provider shadows whatever the caller supplied — anything a
          parent puts on BlockEntranceContext is reset here unless it is threaded
          through as a prop, which is why `instant` is one. `suppress` is not,
          so useNavMorph's blocksSuppressed still never reaches a block. */}
      <BlockEntranceProvider instant={instant}>
        <BlockRenderer
          blocks={caseStudy.body}
          expandButton={showSkeleton ? null : expandButton}
        />
      </BlockEntranceProvider>
    </div>
  )
}
