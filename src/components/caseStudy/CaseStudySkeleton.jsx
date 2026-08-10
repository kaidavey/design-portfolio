import { skeletonRegistry } from '../skeletons/blockSkeletons'

export default function CaseStudySkeleton({ blockTypes }) {
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
            <div key={block._key || index}>
              <SkeletonComponent block={block} />
            </div>
          )
        })}
      </div>
    </>
  )
}
