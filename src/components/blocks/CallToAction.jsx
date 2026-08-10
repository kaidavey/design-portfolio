import { useState } from 'react'

export default function CallToAction({ block }) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="flex flex-col @md:flex-row overflow-clip rounded-[20px] items-start @md:items-center gap-4 px-6 py-5 justify-between w-full [box-shadow:var(--shadow-block-inset)] [background:var(--color-bg-block)] border border-solid [border-color:var(--color-border-block)] antialiased transition-all duration-300">
      <div className="flex flex-col items-start gap-2">
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-secondary)] text-body leading-[1.25rem]">
          {block.title}
        </div>
        <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] [color:var(--color-text-muted)] text-body leading-[1.25rem]">
          {block.description}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <a
          href={block.buttonLink || '#'}
          className="flex overflow-clip rounded-xl flex-col items-start gap-1.5 px-3.5 py-1.5 [box-shadow:var(--shadow-button-inset)] bg-origin-border border border-solid [border-color:var(--color-border-button)] [background:var(--color-bg-button)] transition-all duration-300"
        >
          <div className="tracking-[-0.02em] w-fit font-['DM_Sans',system-ui,sans-serif] font-medium [color:var(--color-text-button)] text-body leading-[1.25rem]">
            {block.buttonText}
          </div>
        </a>
        <button
          onClick={() => setIsVisible(false)}
          className="flex items-center justify-center [color:var(--color-text-muted)] hover:opacity-70 transition-opacity duration-200 cursor-pointer"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5303 5.53033C15.8232 5.23744 15.8232 4.76256 15.5303 4.46967C15.2374 4.17678 14.7626 4.17678 14.4697 4.46967L10 8.93934L5.53033 4.46967C5.23744 4.17678 4.76256 4.17678 4.46967 4.46967C4.17678 4.76256 4.17678 5.23744 4.46967 5.53033L8.93934 10L4.46967 14.4697C4.17678 14.7626 4.17678 15.2374 4.46967 15.5303C4.76256 15.8232 5.23744 15.8232 5.53033 15.5303L10 11.0607L14.4697 15.5303C14.7626 15.8232 15.2374 15.8232 15.5303 15.5303C15.8232 15.2374 15.8232 14.7626 15.5303 14.4697L11.0607 10L15.5303 5.53033Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
