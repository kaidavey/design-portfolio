import { urlFor } from '../../lib/sanity'

export default function ImageRow({ block }) {
  return (
    <div className={`flex items-center justify-center gap-${block.images.length === 3 ? '4' : '6'} w-192.5 antialiased`}>
      {block.images.map((item, index) => (
        <div key={index} className="flex flex-col items-start gap-4 flex-1">
          <img
            src={urlFor(item.image).width(373).height(232).url()}
            alt={item.caption || ''}
            className="w-93.25 h-58 rounded-[20px] shrink-0 object-cover"
          />
          {item.caption && (
            <div className="tracking-[-0.02em] w-fit uppercase font-['DM_Sans',system-ui,sans-serif] font-medium text-[#0000004D] text-sm/4.5">
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
