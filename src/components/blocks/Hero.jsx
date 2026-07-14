import { urlFor } from '../../lib/sanity'

export default function Hero({ block }) {
  return (
    <div className="flex items-center gap-4 w-full antialiased">
      {block.icon && (
        <img
          src={urlFor(block.icon).width(50).height(50).url()}
          alt=""
          className="w-12.5 h-12.5 shrink-0"
        />
      )}
      <div className="tracking-[-0.02em] w-fit shrink-0 font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-[28px]/8.5">
        {block.title}
      </div>
    </div>
  )
}
