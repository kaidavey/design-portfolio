import { skeletonRegistry } from './skeletons/blockSkeletons'
import { CASE_STUDY_LAYOUT } from '../config/caseStudyLayout'

export default function CaseStudySkeleton({ blockTypes }) {
  const { pulseStaggerMs } = CASE_STUDY_LAYOUT.skeleton

  if (!blockTypes || !Array.isArray(blockTypes)) {
    return null
  }

  return (
    <>
      <span className="sr-only" role="status">
        Loading case study
      </span>
      <div className="flex flex-col gap-8" aria-hidden="true">
        {blockTypes.map((block, index) => {
          const SkeletonComponent = skeletonRegistry[block._type]

          if (!SkeletonComponent) {
            return null
          }

          return (
            <div
              key={block._key || index}
              style={{ '--skeleton-delay': `${-index * pulseStaggerMs}ms` }}
            >
              <SkeletonComponent block={block} />
            </div>
          )
        })}
      </div>
    </>
  )
}
