import { motion } from "motion/react"

/**
 * Animated theme toggle icon
 * Shows moon (dark #282828) in light mode with float/scale animation
 * Shows sun (white #FFFFFF) in dark mode with rotation animation
 */
export default function ThemeToggleAnimation({ isDark, size, isHovered }) {
  const shouldAnimate = isHovered

  // Moon animation: subtle float + scale
  const moonSvgVariants = {
    normal: {
      y: 0,
      scale: 1,
    },
    animate: {
      y: [0, -2, 0],
      scale: [1, 1.04, 1],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  }

  // Sun animation: rotation wiggle
  const sunVariants = {
    normal: {
      rotate: 0,
    },
    animate: {
      rotate: [0, 15, -10, 8, -5, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {!isDark ? (
        /* LIGHT MODE: Moon icon - dark color */
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          animate={shouldAnimate ? "animate" : "normal"}
          initial="normal"
          variants={moonSvgVariants}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <path
            d="M19.8694 12.419C19.7874 13.9381 19.2671 15.401 18.3715 16.6307C17.4758 17.8605 16.2432 18.8044 14.8225 19.3486C13.4018 19.8927 11.8539 20.0137 10.3659 19.6968C8.8779 19.38 7.51354 18.639 6.43773 17.5633C5.36192 16.4876 4.62072 15.1233 4.30372 13.6354C3.98672 12.1475 4.10749 10.5995 4.65145 9.17878C5.1954 7.75802 6.13924 6.52523 7.36888 5.62943C8.59851 4.73363 10.0613 4.21318 11.5804 4.13099C11.9344 4.11199 12.1204 4.53399 11.9324 4.83399C11.3036 5.84069 11.0345 7.03074 11.169 8.21002C11.3035 9.3893 11.8336 10.4882 12.6729 11.3275C13.5122 12.1668 14.6111 12.6969 15.7904 12.8314C16.9697 12.9659 18.1597 12.6968 19.1664 12.068C19.4674 11.88 19.8884 12.064 19.8694 12.419Z"
            stroke="#282828"
            fill="none"
          />
        </motion.svg>
      ) : (
        /* DARK MODE: Sun icon - white color */
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          animate={shouldAnimate ? "animate" : "normal"}
          initial="normal"
          variants={sunVariants}
          style={{ overflow: 'visible', display: 'block' }}
        >
          <circle cx="12" cy="12" r="4" stroke="#FFFFFF" fill="none" />
          <path d="M12 2v2" stroke="#FFFFFF" />
          <path d="M12 20v2" stroke="#FFFFFF" />
          <path d="m4.93 4.93 1.41 1.41" stroke="#FFFFFF" />
          <path d="m17.66 17.66 1.41 1.41" stroke="#FFFFFF" />
          <path d="M2 12h2" stroke="#FFFFFF" />
          <path d="M20 12h2" stroke="#FFFFFF" />
          <path d="m6.34 17.66-1.41 1.41" stroke="#FFFFFF" />
          <path d="m19.07 4.93-1.41 1.41" stroke="#FFFFFF" />
        </motion.svg>
      )}
    </div>
  )
}
