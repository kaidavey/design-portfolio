export default function TextBlockCentered({ block }) {
  return (
    <div className="flex overflow-clip rounded-[20px] flex-col items-center gap-4 py-12 px-6 @md:px-25 justify-center [box-shadow:#FFFFFF_-1px_2px_0px_inset] bg-[#F2F2F2] border border-solid border-[#DEDEDE] antialiased w-full">
      {(block.section || block.title) && (
        <div className="flex flex-col items-center gap-1 w-full">
          {block.section && (
            <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
              {block.section}
            </div>
          )}
          {block.title && (
            <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl/7.5">
              {block.title}
            </div>
          )}
        </div>
      )}
      <div className={`tracking-[-0.02em] text-center max-w-prose w-full font-['DM_Sans',system-ui,sans-serif] flex justify-center flex-wrap ${block.section || !block.title ? 'text-black' : 'text-[#0000004D]'} text-base/5`}>
        {block.body}
      </div>
    </div>
  )
}
