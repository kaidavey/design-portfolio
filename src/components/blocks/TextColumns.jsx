export default function TextColumns({ block }) {
  return (
    <div className="flex items-start justify-between w-192.5 gap-6 antialiased">
      <div className="flex items-start gap-1 flex-col flex-1">
        {block.section && (
          <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
            {block.section}
          </div>
        )}
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl/7.5">
          {block.title}
        </div>
      </div>
      <div className="flex items-start flex-col gap-9 flex-1">
        <div className="flex flex-col items-start gap-2 w-83.25">
          {block.paragraphs.map((paragraph, index) => (
            <div
              key={index}
              className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] text-black text-base/5"
            >
              {paragraph}
            </div>
          ))}
          {block.subtitle && (
            <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base/5">
              {block.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
