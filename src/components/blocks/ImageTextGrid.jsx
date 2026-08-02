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
          <div className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 self-stretch [box-shadow:#FFFFFF_-1px_2px_0px_inset] bg-[#F2F2F2] border border-solid border-[#DEDEDE]">
            <div className="flex flex-col items-start gap-2 self-stretch">
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-body leading-[1.25rem]">
                {column.subtitle}
              </div>
              <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-body leading-[1.25rem]">
                {column.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
