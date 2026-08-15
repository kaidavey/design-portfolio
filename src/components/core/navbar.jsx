import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import Icon from './Icon'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  const isHome = location.pathname === '/'
  const isWorkPage = location.pathname.startsWith('/work/')

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleWorkClick = () => {
    if (location.pathname === '/') {
      // Already on home, scroll to projects
      document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home
      navigate('/')
    }
  }

  const handleMailClick = () => {
    window.location.href = 'mailto:kai@example.com'
  }

  return (
    <div
      className={`flex rounded-full items-center justify-center gap-3 p-3 border-solid [border-width:1.7px] bg-origin-border antialiased transition-colors duration-300 ${
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
        iconId={isDark ? 'moon-filled' : 'moon-outlined'}
        onClick={toggleTheme}
        label={isDark ? "Light mode" : "Dark mode"}
        isDark={isDark}
      />
    </div>
  )
}

export function NavButton({ iconId, onClick, isActive = false, label, className = '', isDark = false }) {
  const iconColor = isDark ? '#FFFFFF' : '#282828'

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-10 h-10 flex justify-center items-center transition-all ${
        isActive
          ? ''
          : 'hover:opacity-70'
      } ${className}`}
      style={{ overflow: 'visible' }}
    >
      <Icon id={iconId} size={20} className="shrink-0" style={{ color: iconColor }} />
    </button>
  )
}