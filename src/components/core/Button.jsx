function Shimmer() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-linear-to-r from-transparent via-[var(--color-shimmer-button)] to-transparent transition-transform duration-500 ease-out group-hover:translate-x-[100%]"
    />
  )
}

export default function Button({
  children,
  href,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClasses = "group relative flex overflow-clip rounded-xl flex-col items-start gap-1.5 px-3.5 py-1.5 [box-shadow:var(--shadow-button-inset)] bg-origin-border border border-solid [border-color:var(--color-border-button)] [background:var(--color-bg-button)] transition-all duration-300"

  const textClasses = "relative tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-button)] text-body leading-[1.25rem]"

  const combinedClasses = `${baseClasses} ${className}`.trim()

  // Render as link if href is provided
  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        <Shimmer />
        <div className={textClasses}>
          {children}
        </div>
      </a>
    )
  }

  // Render as button
  return (
    <button type={type} onClick={onClick} className={combinedClasses} {...props}>
      <Shimmer />
      <div className={textClasses}>
        {children}
      </div>
    </button>
  )
}