export default function CallToAction({ block }) {
  return (
    <div className="flex flex-col @md:flex-row overflow-clip rounded-[20px] items-start @md:items-center gap-4 px-6 py-5 justify-between w-full [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] antialiased transition-all duration-300">
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-body leading-[1.25rem]">
          {block.title}
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
          {block.description}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          href={block.buttonLink || '#'}
          className="flex overflow-clip rounded-xl flex-col items-start gap-1.5 px-3.5 py-1.5 [box-shadow:var(--shadow-button-inset)] bg-origin-border border border-solid [border-color:var(--color-border-button)] [background:var(--color-bg-button)] transition-all duration-300"
        >
          <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-button)] text-body leading-[1.25rem]">
            {block.buttonText}
          </div>
        </a>
        <div className="content-center text-center font-['SFPro-Semibold','SF_Pro',system-ui,sans-serif] font-[590] flex justify-center flex-wrap [color:var(--color-text-muted)] text-body leading-[1.25rem]">
          →
        </div>
      </div>
    </div>
  )
}
