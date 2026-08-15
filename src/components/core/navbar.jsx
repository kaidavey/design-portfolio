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
      className={`flex rounded-full items-center justify-center gap-2.5 p-3 border-solid [border-width:1.7px] bg-origin-border antialiased transition-colors duration-300 ${
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
        label="Say hi"
        isDark={isDark}
      />
      <NavButton
        iconId="theme-toggle"
        onClick={toggleTheme}
        label={isDark ? "Light mode" : "Dark mode"}
        isDark={isDark}
        isThemeToggle={true}
      />
    </div>
  )
}

export function NavButton({ iconId, onClick, isActive = false, label, className = '', isDark = false, isThemeToggle = false }) {
  const iconColor = isDark ? '#FFFFFF' : '#282828'
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
      className={`w-11 h-11 flex justify-center items-center ${className}`}
      style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
    >
      <AnimatedIcon
        id={iconId}
        size={26}
        className="shrink-0"
        style={{ color: iconColor }}
        isHovered={isHovered}
        isDark={isThemeToggle ? isDark : undefined}
      />
    </button>
  )
}



