import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useCaseStudies } from '../../hooks/useCaseStudies'
import AnimatedIcon from './AnimatedIcon'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { caseStudies } = useCaseStudies()

  const isHome = location.pathname === '/'
  const isWorkPage = location.pathname.startsWith('/work/')

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleWorkClick = () => {
    // Navigate to first case study if available
    if (caseStudies.length > 0) {
      navigate(`/work/${caseStudies[0].slug.current}`)
    }
  }

  const handleMailClick = () => {
    window.location.href = 'mailto:kai@example.com'
  }

  return (
    <div
      className={`flex rounded-full items-center justify-center gap-2.25 p-3 border-solid [border-width:1.7px] bg-origin-border antialiased transition-colors duration-300 ${
        isDark ? 'border-[#222222]' : 'border-[#EAEAEA]'
      }`}
      style={{
        boxShadow: isDark
          ? '#FFFFFF4D -1px 1.2px 0px inset'
          : '#FFFFFF -1px 1.2px 0px inset, #00000008 0px 8px 10px',
        backgroundImage: isDark
          ? 'linear-gradient(in oklab 180deg, oklab(37.5% 0 0) 0%, 62.55%, oklab(25.2% 0 0) 99.99%)'
          : 'linear-gradient(in oklab 180deg, oklab(97.5% 0 0) 0%, 79.83%, oklab(93.1% 0 0) 99.99%)',
        overflow: 'visible',
      }}
    >
      <NavButton
        iconId={isHome ? 'home-filled' : 'home-outlined'}
        onClick={handleHomeClick}
        isActive={isHome}
        label="Home"
        isDark={isDark}
      />
      <NavButton
        iconId={isWorkPage ? 'briefcase-filled' : 'briefcase-outlined'}
        onClick={handleWorkClick}
        isActive={isWorkPage}
        label="Work"
        isDark={isDark}
      />
      <NavButton
        iconId="hand-wave"
        onClick={handleMailClick}
        label="About"
        isDark={isDark}
      />
      <NavButton
        iconId="theme-toggle"
        onClick={toggleTheme}
        label="Theme"
        isDark={isDark}
        isThemeToggle={true}
      />
    </div>
  )
}

export function NavButton({ iconId, onClick, isActive = false, label, className = '', isDark = false, isThemeToggle = false }) {
  const iconColor = isDark ? '#FFFFFF' : '#282828'
  const [isHovered, setIsHovered] = React.useState(false)
  const [showTooltip, setShowTooltip] = React.useState(false)
  const timeoutRef = React.useRef(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    // Start 2-second timer for tooltip
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 1800)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowTooltip(false)
    // Clear timeout if user moves away before 2 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  React.useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
      className={`w-9.5 h-9.5 flex justify-center items-center ${className}`}
      style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
    >
      <AnimatedIcon
        id={iconId}
        size={21}
        className="shrink-0"
        style={{ color: iconColor }}
        isHovered={isHovered}
        isDark={isThemeToggle ? isDark : undefined}
      />
      {showTooltip && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px',
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
          }}
        >
          {label}
        </div>
      )}
    </button>
  )
}



