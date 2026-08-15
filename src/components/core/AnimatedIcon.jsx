import { motion } from "motion/react"
import Icon from './Icon'
import AnimatedBriefcase from './AnimatedBriefcase'
import AnimatedThemeIcon from './AnimatedThemeIcon'

const iconAnimations = {
  'hand-wave': {
    normal: {
      rotate: 0,
      originX: "50%",
      originY: "90%"
    },
    animate: {
      rotate: [0, -15, 10, -5, 0],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  },
  // More animations will be added for other outlined icons
}

export default function AnimatedIcon({ id, size, className, style, isHovered, isDark, ...props }) {
  // Route briefcase (both outlined and filled) to specialized component
  if (id === 'briefcase-outlined' || id === 'briefcase-filled') {
    return <AnimatedBriefcase id={id} size={size} className={className} style={style} isHovered={isHovered} />
  }

  // Route theme toggle to specialized component
  if (id === 'theme-toggle') {
    return <AnimatedThemeIcon isDark={isDark} size={size} className={className} style={style} isHovered={isHovered} />
  }

  const animation = iconAnimations[id]

  // If no animation for this icon, return regular Icon
  if (!animation) {
    return <Icon id={id} size={size} className={className} style={style} {...props} />
  }

  return (
    <motion.div
      animate={isHovered ? "animate" : "normal"}
      initial="normal"
      variants={animation}
      style={{ display: 'inline-flex', pointerEvents: 'none' }}
    >
      <Icon id={id} size={size} className={className} style={style} {...props} />
    </motion.div>
  )
}
