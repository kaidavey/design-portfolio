import { urlFor } from '../../lib/sanity'

export default function TextCardRow({ block }) {
  return (
    <div className="flex flex-col @md:flex-row items-stretch gap-4 w-full antialiased">
      {block.cards.map((card, index) => (
        <div
          key={index}
          className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 flex-1 w-full [box-shadow:#FFFFFF_-1px_2px_0px_inset] bg-[#F2F2F2] border border-solid border-[#DEDEDE]"
        >
          {card.icon && (
            <img
              src={urlFor(card.icon).width(24).height(24).url()}
              alt=""
              className="shrink-0 size-6"
            />
          )}
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] font-medium text-[#2F2F2F] text-base/5">
              {card.subtitle}
            </div>
            <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base/5">
              {card.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
