import Icon from './Icon'
import BriefcaseAnimation from './animations/BriefcaseAnimation'
import ThemeToggleAnimation from './animations/ThemeToggleAnimation'
import HandWaveAnimation from './animations/HandWaveAnimation'

/**
 * Router component for animated navbar icons
 * Routes specific icon IDs to their corresponding animation components
 * Falls back to static Icon for non-animated icons
 */
export default function AnimatedIcon({ id, size, className, style, isHovered, isDark, ...props }) {
  // Route briefcase icons (outlined/filled)
  if (id === 'briefcase-outlined' || id === 'briefcase-filled') {
    return <BriefcaseAnimation id={id} size={size} style={style} isHovered={isHovered} />
  }

  // Route theme toggle icon
  if (id === 'theme-toggle') {
    return <ThemeToggleAnimation isDark={isDark} size={size} isHovered={isHovered} />
  }

  // Route hand wave icon
  if (id === 'hand-wave') {
    return <HandWaveAnimation size={size} className={className} style={style} isHovered={isHovered} />
  }

  // Default: return static icon with no animation
  return <Icon id={id} size={size} className={className} style={style} {...props} />
}
