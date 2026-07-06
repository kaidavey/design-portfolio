import { urlFor } from '../../lib/sanity'

export default function TextImageRow({ block }) {
  return (
    <div className="flex items-center justify-between antialiased">
      <div className="flex flex-col items-start gap-4">
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl/7.5">
          {block.title}
        </div>
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
      <img
        src={urlFor(block.image).width(373).height(232).url()}
        alt={block.title}
        className="w-93.25 h-58 rounded-[20px] shrink-0 object-cover"
      />
    </div>
  )
}
