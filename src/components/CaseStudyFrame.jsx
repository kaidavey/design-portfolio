import {
  FRAME_DEFAULTS,
  FRAME_PADDING,
  FRAME_BACKGROUND,
  frameBoxStyle,
} from '../config/imageFrame'

/**
 * CaseStudyFrame - The surface a framed image sits on.
 *
 * The frame is the responsive part. It fills the width it is given and keeps
 * the shape the editor chose, so it grows and shrinks as the shell moves
 * between compact and expanded and as the viewport changes. Whatever is inside
 * is centred and left alone — scaled down only far enough to fit, never
 * cropped and never stretched.
 *
 * Sizing is container-relative throughout (see PAPER_CONTRACT.md): the inset
 * steps up at the container's @md breakpoint, not the viewport's.
 */
export default function CaseStudyFrame({ frame, className = '', children }) {
  const { aspectRatio, padding, background } = { ...FRAME_DEFAULTS, ...(frame || {}) }

  const paddingClass = FRAME_PADDING[padding] ?? FRAME_PADDING[FRAME_DEFAULTS.padding]
  const backgroundClass = FRAME_BACKGROUND[background] ?? FRAME_BACKGROUND[FRAME_DEFAULTS.background]

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[20px] mx-auto border border-solid transition-all duration-300 ${paddingClass} ${backgroundClass} ${className}`}
      style={frameBoxStyle(aspectRatio)}
    >
      {children}
    </div>
  )
}
