export default function TextBlockCentered({ block }) {
  return (
    <div className="flex overflow-clip rounded-[20px] flex-col items-center gap-4 py-12 px-6 @md:px-25 justify-center [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] antialiased w-full transition-all duration-300">
      {(block.section || block.title) && (
        <div className="flex flex-col items-center gap-1 w-full">
          {block.section && (
            <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-muted)] text-section-label">
              {block.section}
            </div>
          )}
          {block.title && (
            <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-primary)] text-fluid-subheading">
              {block.title}
            </div>
          )}
        </div>
      )}
      <div className={`tracking-[-0.02em] text-center max-w-prose w-full font-['DM_Sans',system-ui,sans-serif] flex justify-center flex-wrap ${block.section || !block.title ? '[color:var(--color-text-primary)]' : '[color:var(--color-text-muted)]'} text-body leading-[1.25rem]`}>
        {block.body}
      </div>
    </div>
  )
}
