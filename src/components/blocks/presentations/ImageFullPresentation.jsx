/**
 * ImageFullPresentation - Pure presentation component
 *
 * Full-width standalone image block with optional caption.
 *
 * Props: Plain, well-named JavaScript values
 * No Sanity coupling, no side effects
 */
export default function ImageFullPresentation({ imageUrl, imageAlt, caption }) {
  return (
    <div className="flex flex-col items-start gap-3 w-full">
      {/* Image */}
      <div className="w-full overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full aspect-[766/349] object-cover [box-shadow:rgba(0,0,0,0.05)_0px_0px_10px_2px_inset]"
        />
      </div>

      {/* Optional Caption */}
      {caption && (
        <p className="tracking-[-0.02em] font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-sm leading-[18px]">
          {caption}
        </p>
      )}
    </div>
  )
}
