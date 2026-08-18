import React from 'react'

// Centralized tooltip styling - all tooltips inherit from here
const TOOLTIP_STYLES = {
  paddingInline: '10px',
  paddingBlock: '4px',
  borderRadius: '4px',
  backgroundColor: '#1E1E1E',
  borderWidth: '0.3px',
  borderStyle: 'solid',
  borderColor: '#3F3F3F',
  whiteSpace: 'nowrap',
  fontSize: '13px',
  letterSpacing: '-0.26249px',
  lineHeight: '128.6%',
  fontFamily: '"DM Sans", system-ui, sans-serif',
  fontWeight: 500,
  color: '#FFFFFF',
  zIndex: 1000,
}

const TOOLTIP_DELAY = 1000 // 2 seconds
const TOOLTIP_OFFSET = 8 // Distance from element in pixels

/**
 * Tooltip component that wraps children and shows a tooltip above after hovering for 2 seconds
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to wrap (usually a button)
 * @param {string} props.label - The tooltip text to display
 * @param {number} props.offset - Optional custom offset distance (defaults to TOOLTIP_OFFSET)
 */
export default function Tooltip({ children, label, offset }) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const timeoutRef = React.useRef(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, TOOLTIP_DELAY)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const effectiveOffset = offset !== undefined ? offset : TOOLTIP_OFFSET

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {showTooltip && (
        <div
          className="absolute pointer-events-none"
          style={{
            ...TOOLTIP_STYLES,
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            marginTop: `-${effectiveOffset}px`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Export styles and delay for cases where they need to be referenced
export { TOOLTIP_STYLES, TOOLTIP_DELAY, TOOLTIP_OFFSET }
