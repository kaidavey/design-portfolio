import CaseStudyMedia from '../CaseStudyMedia'

/**
 * ImageRow - Two or three images side by side.
 *
 * Each slot holds a `caseStudyImage`, so any of them can be a framed device
 * shot instead of a plain image.
 */
export default function ImageRow({ block }) {
  const images = block.images || []

  return (
    <div
      className={`flex flex-col @md:flex-row items-start justify-center w-full antialiased ${
        images.length === 3 ? 'gap-4' : 'gap-6'
      }`}
    >
      {images.map((item, index) => (
        <figure key={item._key || index} className="flex flex-col items-start gap-4 flex-1 w-full m-0">
          <CaseStudyMedia
            media={item}
            sizes="(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px"
            maxWidth={880}
            fillClassName="w-full rounded-[20px] object-cover"
          />
          {item.caption && (
            <figcaption className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-caption">
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
