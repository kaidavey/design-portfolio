import { motion } from "motion/react"
import Icon from '../Icon'

/**
 * Hand wave animation
 * Rotates hand icon back and forth with decreasing amplitude (waving motion)
 * Pivot point at bottom-center (wrist position)
 */
export default function HandWaveAnimation({ size, className, style, isHovered }) {
  const variants = {
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
  }

  return (
    <motion.div
      animate={isHovered ? "animate" : "normal"}
      initial="normal"
      variants={variants}
      style={{ display: 'inline-flex', pointerEvents: 'none' }}
    >
      <Icon id="hand-wave" size={size} className={className} style={style} />
    </motion.div>
  )
}
