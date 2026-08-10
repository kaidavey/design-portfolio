import { SkeletonShape, SkeletonLines } from './SkeletonPrimitives'
import { CASE_STUDY_LAYOUT } from '../../config/caseStudyLayout'

const { imageRadius } = CASE_STUDY_LAYOUT.skeleton

// ProjectDetails - Four-column metadata grid
function ProjectDetailsSkeleton() {
  return (
    <div className="flex flex-col @md:flex-row items-start gap-5 justify-between w-full">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col items-start gap-2">
          <SkeletonShape w="60px" h="0.8125rem" />
          <SkeletonShape w="100px" h="0.9375rem" />
        </div>
      ))}
    </div>
  )
}

// Hero - Icon + title row
function HeroSkeleton() {
  return (
    <div className="flex items-center gap-4 w-full">
      <SkeletonShape w="50px" h="50px" className="shrink-0" />
      <SkeletonShape w="280px" h="1.1875rem" />
    </div>
  )
}

// TextImageRow - Two-column layout with text and image
function TextImageRowSkeleton() {
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:items-center gap-8 @lg:justify-between w-full">
      <div className="flex flex-col items-start gap-4 flex-1 w-full">
        <SkeletonShape w="200px" h="1.1875rem" />
        <SkeletonLines count={3} />
      </div>
      <div className="flex-1 w-full @lg:w-auto @lg:max-w-md">
        <SkeletonShape w="100%" h="auto" radius={imageRadius} style={{ aspectRatio: '4 / 3' }} />
      </div>
    </div>
  )
}

// ImageRow - 2-3 images side by side with optional captions
function ImageRowSkeleton() {
  const count = 2 // Default to 2 images since we don't know from _type alone
  return (
    <div className={`flex flex-col @md:flex-row items-center justify-center gap-${count === 3 ? '4' : '6'} w-full`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col items-start gap-4 flex-1 w-full">
          <SkeletonShape w="100%" h="auto" radius={imageRadius} style={{ aspectRatio: '4 / 3' }} />
          <SkeletonShape w="120px" h="0.8125rem" />
        </div>
      ))}
    </div>
  )
}

// ImageTextGrid - Image + card grid (2-3 columns)
function ImageTextGridSkeleton() {
  const count = 2 // Default to 2 columns
  return (
    <div className={`flex flex-col @md:flex-row items-center justify-center gap-${count === 3 ? '4' : '6'} w-full`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col items-start gap-4 self-stretch flex-1">
          <SkeletonShape w="100%" h="auto" radius={imageRadius} style={{ aspectRatio: '4 / 3' }} />
          <div className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 self-stretch [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)]">
            <div className="flex flex-col items-start gap-2 self-stretch">
              <SkeletonShape w="140px" h="0.9375rem" />
              <SkeletonLines count={2} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// CallToAction - Card with title, description, and button
function CallToActionSkeleton() {
  return (
    <div className="flex flex-col @md:flex-row overflow-clip rounded-[20px] items-start @md:items-center gap-4 px-6 py-5 justify-between w-full [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)]">
      <div className="flex flex-col items-start gap-2">
        <SkeletonShape w="180px" h="0.9375rem" />
        <SkeletonShape w="240px" h="0.9375rem" />
      </div>
      <div className="flex items-center gap-6">
        <SkeletonShape w="100px" h="32px" radius="12px" />
        <SkeletonShape w="14px" h="0.9375rem" />
      </div>
    </div>
  )
}

// TextBlockCentered - Centered text card with optional section/title
function TextBlockCenteredSkeleton() {
  return (
    <div className="flex overflow-clip rounded-[20px] flex-col items-center gap-4 py-12 px-6 @md:px-25 justify-center [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] w-full">
      <div className="flex flex-col items-center gap-1 w-full">
        <SkeletonShape w="80px" h="0.8125rem" />
        <SkeletonShape w="200px" h="1.1875rem" />
      </div>
      <div className="flex flex-col items-center gap-2 max-w-prose w-full">
        <SkeletonShape w="90%" h="0.9375rem" />
        <SkeletonShape w="85%" h="0.9375rem" />
        <SkeletonShape w="70%" h="0.9375rem" />
      </div>
    </div>
  )
}

// TextCardRow - Row of 2-3 cards with icon/subtitle/description
function TextCardRowSkeleton() {
  const count = 2 // Default to 2 cards
  return (
    <div className="flex flex-col @md:flex-row items-stretch gap-4 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 flex-1 w-full [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)]"
        >
          <SkeletonShape w="24px" h="24px" className="shrink-0" />
          <div className="flex flex-col items-start gap-2 self-stretch">
            <SkeletonShape w="140px" h="0.9375rem" />
            <SkeletonLines count={2} />
          </div>
        </div>
      ))}
    </div>
  )
}

// TextColumns - Two-column layout with section/title on left, paragraphs on right
function TextColumnsSkeleton() {
  return (
    <div className="flex flex-col @md:flex-row items-start justify-between w-full gap-6">
      <div className="flex items-start gap-1 flex-col flex-1 w-full">
        <SkeletonShape w="80px" h="0.8125rem" />
        <SkeletonShape w="180px" h="1.1875rem" />
      </div>
      <div className="flex items-start flex-col gap-9 flex-1 w-full">
        <div className="flex flex-col items-start gap-2 w-full">
          <SkeletonLines count={4} />
        </div>
      </div>
    </div>
  )
}

// TextRowTwoColumn - Section/title header with two-column paragraphs below
function TextRowTwoColumnSkeleton() {
  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <div className="flex flex-col items-start gap-1 w-full">
        <SkeletonShape w="80px" h="0.8125rem" />
        <SkeletonShape w="200px" h="1.1875rem" />
      </div>
      <div className="flex flex-col @md:flex-row items-start w-full gap-6">
        <div className="flex flex-col items-start gap-4 flex-1">
          <SkeletonLines count={3} />
        </div>
        <div className="flex flex-col items-start gap-4 flex-1">
          <SkeletonLines count={3} />
        </div>
      </div>
    </div>
  )
}

// ImageFull - Full-width image with optional caption
function ImageFullSkeleton() {
  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <div className="w-full overflow-hidden rounded-xl">
        <SkeletonShape w="100%" h="auto" radius="12px" style={{ aspectRatio: '16 / 9' }} />
      </div>
      <SkeletonShape w="180px" h="0.8125rem" />
    </div>
  )
}

// Spacer - Reserves height, renders nothing visible
function SpacerSkeleton({ block }) {
  return <div style={{ height: `${block.height}px` }} aria-hidden="true" />
}

export const skeletonRegistry = {
  projectDetails: ProjectDetailsSkeleton,
  hero: HeroSkeleton,
  textImageRow: TextImageRowSkeleton,
  imageRow: ImageRowSkeleton,
  imageTextGrid: ImageTextGridSkeleton,
  callToAction: CallToActionSkeleton,
  textBlockCentered: TextBlockCenteredSkeleton,
  textCardRow: TextCardRowSkeleton,
  textColumns: TextColumnsSkeleton,
  textRowTwoColumn: TextRowTwoColumnSkeleton,
  imageFull: ImageFullSkeleton,
  spacer: SpacerSkeleton,
}
