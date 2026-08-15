import CaseStudyImage from '../CaseStudyImage'

export default function ImageRow({ block }) {
  return (
    <div className={`flex flex-col @md:flex-row items-center justify-center gap-${block.images.length === 3 ? '4' : '6'} w-full antialiased`}>
      {block.images.map((item, index) => (
        <div key={index} className="flex flex-col items-start gap-4 flex-1 w-full">
          <CaseStudyImage
            source={item.image}
            alt={item.caption || ''}
            sizes="(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px"
            maxWidth={880}
            className="w-full rounded-[20px] object-cover"
          />
          {item.caption && (
            <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-caption">
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
