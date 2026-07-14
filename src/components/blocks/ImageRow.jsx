import { urlFor } from '../../lib/sanity'

export default function ImageRow({ block }) {
  return (
    <div className={`flex flex-col @md:flex-row items-center justify-center gap-${block.images.length === 3 ? '4' : '6'} w-full antialiased`}>
      {block.images.map((item, index) => (
        <div key={index} className="flex flex-col items-start gap-4 flex-1 w-full">
          <img
            src={urlFor(item.image).width(800).url()}
            alt={item.caption || ''}
            className="w-full aspect-[373/232] rounded-[20px] object-cover"
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
