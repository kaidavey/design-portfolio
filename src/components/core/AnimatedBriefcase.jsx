import { motion, useAnimation } from "motion/react"
import { useCallback } from "react"

export default function AnimatedBriefcase({ size, className, style }) {
  const controls = useAnimation()

  const handleMouseEnter = useCallback(() => {
    controls.start("animate")
  }, [controls])

  const handleMouseLeave = useCallback(() => {
    controls.start("normal")
  }, [controls])

  const variants = {
    normal: {
      scaleY: 1,
      originX: "50%",
      originY: "100%",
      transition: {
        duration: 0.4,
        ease: "linear",
      },
    },
    animate: {
      scaleY: [1, 0.6, 0.3, 0.1, -0.1, -0.3, -0.5],
      transition: {
        duration: 0.4,
        ease: "linear",
      },
    },
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex' }}
    >
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ overflow: 'visible', ...style }}
      >
        {/* Briefcase body - static */}
        <path
          d="M8.48173 6.725V4.832C8.48173 4.234 8.96673 3.75 9.56373 3.75H14.7037C15.3007 3.75 15.7857 4.234 15.7857 4.832V6.725M8.48173 6.725H15.7857M8.48173 6.725H4.71973C3.06273 6.725 1.71973 8.069 1.71973 9.725V17.25C1.71973 18.907 3.06273 20.25 4.71973 20.25H19.2767C20.9337 20.25 22.2767 18.907 22.2767 17.25V9.725C22.2767 8.069 20.9337 6.725 19.2767 6.725H15.7857"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Animated flap - positioned to perfectly overlap the bottom portion */}
        <motion.rect
          x="1.71973"
          y="6.81"
          width="20.557"
          height="13"
          rx="2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={controls}
          initial="normal"
          variants={variants}
        />
      </svg>
    </motion.div>
  )
}
