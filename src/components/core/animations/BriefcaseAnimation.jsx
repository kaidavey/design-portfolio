import { motion } from "motion/react"

/**
 * Animated briefcase icon with opening flap animation
 * Shows outlined version with flap animation on hover, filled version when active
 */
export default function BriefcaseAnimation({ id, size, style, isHovered }) {
  const isFilled = id === 'briefcase-filled'
  const shouldAnimate = !isFilled && isHovered

  const flapVariants = {
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ overflow: 'visible', ...style }}
    >
      {isFilled ? (
        /* Filled briefcase - no animation */
        <>
          <path
            d="M1.71973 9.7251V17.2501C1.71973 18.9071 3.06273 20.2501 4.71973 20.2501H19.2767C20.9337 20.2501 22.2767 18.9071 22.2767 17.2501V9.7251C22.2767 8.0691 20.9337 6.7251 19.2767 6.7251H15.7857H8.48173H4.71973C3.06273 6.7251 1.71973 8.0691 1.71973 9.7251Z"
            fill="currentColor"
          />
          <path
            d="M8.48173 6.725V4.832C8.48173 4.234 8.96673 3.75 9.56373 3.75H14.7037C15.3007 3.75 15.7857 4.234 15.7857 4.832V6.725M8.48173 6.725H4.71973C3.06273 6.725 1.71973 8.069 1.71973 9.725V17.25C1.71973 18.907 3.06273 20.25 4.71973 20.25H19.2767C20.9337 20.25 22.2767 18.907 22.2767 17.25V9.725C22.2767 8.069 20.9337 6.725 19.2767 6.725H15.7857M8.48173 6.725H15.7857"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      ) : (
        /* Outlined briefcase with animated flap */
        <>
          <path
            d="M8.48173 6.725V4.832C8.48173 4.234 8.96673 3.75 9.56373 3.75H14.7037C15.3007 3.75 15.7857 4.234 15.7857 4.832V6.725M8.48173 6.725H15.7857M8.48173 6.725H4.71973C3.06273 6.725 1.71973 8.069 1.71973 9.725V17.25C1.71973 18.907 3.06273 20.25 4.71973 20.25H19.2767C20.9337 20.25 22.2767 18.907 22.2767 17.25V9.725C22.2767 8.069 20.9337 6.725 19.2767 6.725H15.7857"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <motion.rect
            x="1.71973"
            y="6.81"
            width="20.557"
            height="13"
            rx="2.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            animate={shouldAnimate ? "animate" : "normal"}
            initial="normal"
            variants={flapVariants}
          />
        </>
      )}
    </svg>
  )
}
