import { CASE_STUDY_LAYOUT } from '../../config/caseStudyLayout'

const { radius } = CASE_STUDY_LAYOUT.skeleton

export function SkeletonShape({ w = '100%', h = '1em', radius: customRadius, className = '', style = {} }) {
  return (
    <div
      className={`skeleton-shape animate-skeleton ${className}`}
      style={{
        width: w,
        height: h,
        backgroundColor: 'var(--color-skeleton)',
        borderRadius: customRadius ?? radius,
        ...style,
      }}
    />
  )
}

export function SkeletonLines({ count = 3, widths }) {
  const defaultWidths = ['100%', '96%', '88%', '92%']
  const effectiveWidths = widths || defaultWidths

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, index) => {
        const isLast = index === count - 1
        const width = isLast
          ? '60%'
          : effectiveWidths[index % effectiveWidths.length]

        return (
          <SkeletonShape
            key={index}
            w={width}
            h="0.9375rem"
          />
        )
      })}
    </div>
  )
}
