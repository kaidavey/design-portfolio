import { urlFor } from '../../lib/sanity'

export default function TextCardRow({ block }) {
  return (
    <div className="flex flex-col @md:flex-row items-stretch gap-4 w-full antialiased">
      {(block.cards || []).map((card, index) => (
        <div
          key={card._key || index}
          className="flex overflow-clip rounded-[20px] flex-col items-start gap-9 p-6 flex-1 w-full [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] transition-all duration-300"
        >
          {card.icon && (
            <img
              src={urlFor(card.icon).width(24).height(24).url()}
              alt=""
              className="shrink-0 size-6"
            />
          )}
          <div className="flex flex-col items-start gap-2 self-stretch">
            <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-body leading-[1.25rem]">
              {card.subtitle}
            </div>
            <div className="tracking-[-0.02em] self-stretch font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
              {card.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
