import { FRAME_DEFAULTS, FRAME_PADDING, imageHeightStyle } from '../config/imageFrame'

/**
 * CaseStudyFrame - The surface a framed image sits on.
 *
 * It fills the width it is given and stands exactly as tall as `height` asks,
 * so it is the part that responds when the shell moves between compact and
 * expanded. Whatever is inside is centred and left alone — scaled down only far
 * enough to fit, never cropped and never stretched.
 *
 * Unlike other surfaced blocks, the frame has no border, background, or inset
 * shadow. It's a clean rounded container that lets the image speak for itself.
 *
 * With no height it falls back to sizing from its content, which is what an
 * image inside a row or grid wants — there the slot governs the height.
 */
export default function CaseStudyFrame({ frame, height, className = '', children }) {
  const { padding } = { ...FRAME_DEFAULTS, ...(frame || {}) }
  const paddingClass = FRAME_PADDING[padding] ?? FRAME_PADDING[FRAME_DEFAULTS.padding]

  return (
    <div
      className={`flex items-center justify-center w-full ${paddingClass} overflow-clip rounded-[20px] ${className}`}
      style={imageHeightStyle(height) ?? undefined}
    >
      {children}
    </div>
  )
}
