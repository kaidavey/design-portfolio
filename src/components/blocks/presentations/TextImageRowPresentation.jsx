/**
 * TextImageRowPresentation - Pure presentation component
 *
 * This is the shape Paper will generate. It:
 * - Has no Sanity coupling
 * - Receives plain, well-named props
 * - Uses theme tokens
 * - Sizes via container queries
 * - Has no mount/entrance animations
 */
export default function TextImageRowPresentation({
  title,
  paragraphs = [],
  subtitle,
  imageUrl,
  imageAlt,
}) {
  return (
    <div className="flex flex-col @lg:flex-row items-start @lg:items-center gap-8 @lg:justify-between w-full">
      {/* Text column */}
      <div className="flex flex-col items-start gap-4 flex-1 w-full">
        <h2 className="tracking-tight font-['DM_Sans',system-ui,sans-serif] font-medium text-black text-2xl">
          {title}
        </h2>
        <div className="flex flex-col items-start gap-2 w-full">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-black text-base"
            >
              {paragraph}
            </p>
          ))}
          {subtitle && (
            <p className="tracking-tight font-['DM_Sans',system-ui,sans-serif] text-[#0000004D] text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Image column */}
      <div className="flex-1 w-full @lg:w-auto @lg:max-w-md">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full aspect-[16/10] rounded-[20px] object-cover"
        />
      </div>
    </div>
  )
}
