import CaseStudyImage from '../CaseStudyImage'

export default function ImageTextGrid({ block }) {
  return (
    <div className={`flex flex-col @md:flex-row items-center justify-center gap-${block.columns.length === 3 ? '4' : '6'} w-full antialiased`}>
      {block.columns.map((column, index) => (
        <div key={index} className="flex flex-col items-start gap-4 self-stretch flex-1">
          <CaseStudyImage
            source={column.image}
            alt={column.subtitle}
            sizes="(max-width: 640px) 92vw, (max-width: 1040px) 45vw, 440px"
            maxWidth={880}
            className="rounded-[20px] self-stretch flex-1 object-cover"
          />
          <div className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 self-stretch [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] transition-all duration-300">
            <div className="flex flex-col items-start gap-2 self-stretch">
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-body leading-[1.25rem]">
                {column.subtitle}
              </div>
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
                {column.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
