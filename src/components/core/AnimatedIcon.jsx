import { motion, useAnimation } from "motion/react"
import { useCallback } from "react"
import Icon from './Icon'
import AnimatedBriefcase from './AnimatedBriefcase'

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

export default function AnimatedIcon({ id, size, className, style, ...props }) {
  // Route briefcase to specialized component with path animations
  if (id === 'briefcase-outlined') {
    return <AnimatedBriefcase size={size} className={className} style={style} />
  }

  const controls = useAnimation()
  const animation = iconAnimations[id]

  const handleMouseEnter = useCallback(() => {
    if (animation) {
      controls.start("animate")
    }
  }, [controls, animation])

  const handleMouseLeave = useCallback(() => {
    if (animation) {
      controls.start("normal")
    }
  }, [controls, animation])

  // If no animation for this icon, return regular Icon
  if (!animation) {
    return <Icon id={id} size={size} className={className} style={style} {...props} />
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={controls}
      initial="normal"
      variants={animation}
      style={{ display: 'inline-flex' }}
    >
      <Icon id={id} size={size} className={className} style={style} {...props} />
    </motion.div>
  )
}
