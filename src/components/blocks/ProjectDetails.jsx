export default function ProjectDetails({ block }) {
  return (
    <div className="flex items-start gap-5 justify-between antialiased">
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
          Role
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg/5.5">
          {block.role}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
          Timeline
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg/5.5">
          {block.timeline}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
          Team
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg/5.5">
          {block.team}
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
          Tools
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-lg/5.5">
          {block.tools}
        </div>
      </div>
    </div>
  )
}
