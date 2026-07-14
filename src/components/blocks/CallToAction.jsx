export default function CallToAction({ block }) {
  return (
    <div className="flex flex-col @md:flex-row overflow-clip rounded-[20px] items-start @md:items-center gap-4 px-6 py-5 justify-between w-full [box-shadow:#FFFFFF_-1px_2px_0px_inset] bg-[#F2F2F2] border border-solid border-[#DEDEDE] antialiased">
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-base/5">
          {block.title}
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base/5">
          {block.description}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          href={block.buttonLink || '#'}
          className="flex overflow-clip rounded-xl flex-col items-start gap-1.5 px-3.5 py-1.5 [box-shadow:#FFFFFF_0px_1px_0px_inset] bg-origin-border border border-solid border-[#E0E0E0]"
          style={{ backgroundImage: 'linear-gradient(in oklab 0deg, oklab(95.5% 0 0) -8.17%, oklab(97.5% 0 0) 77.61%)' }}
        >
          <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-base/5">
            {block.buttonText}
          </div>
        </a>
        <div className="content-center text-center font-['SFPro-Semibold','SF_Pro',system-ui,sans-serif] font-[590] flex justify-center flex-wrap text-[#0000004D] text-base/5">
          →
        </div>
      </div>
    </div>
  )
}
