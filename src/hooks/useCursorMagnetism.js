import { useEffect, useLayoutEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

// Shared cursor position — plain values updated by a single pointermove listener.
let sharedCursorX = 0
let sharedCursorY = 0
let listenerCount = 0
let listenerCleanup = null

function ensureSharedListener() {
  if (listenerCount === 0) {
    const handler = (e) => {
      sharedCursorX = e.clientX
      sharedCursorY = e.clientY
    }

    document.addEventListener('pointermove', handler, { passive: true })

    listenerCleanup = () => {
      document.removeEventListener('pointermove', handler)
      listenerCleanup = null
    }
  }

  listenerCount++

  return () => {
    listenerCount--
    if (listenerCount === 0 && listenerCleanup) {
      listenerCleanup()
    }
  }
}

/**
 * Point-to-rect distance with weighted axes.
 * Clamps cursor into rect bounds, then measures euclidean distance.
 * Y-axis is weighted lower to reduce sensitivity to vertical movement.
 */
function distanceToRect(cursorX, cursorY, rect, weightY) {
  const clampedX = Math.max(rect.left, Math.min(rect.right, cursorX))
  const clampedY = Math.max(rect.top, Math.min(rect.bottom, cursorY))

  const dx = cursorX - clampedX
  const dy = (cursorY - clampedY) * weightY

  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Smoothstep easing for falloff curve.
 */
function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

/**
 * Cursor magnetism for neighbor cards.
 *
 * @param {React.RefObject} cardRef - Ref to the card DOM element
 * @param {'prev'|'next'} side - Which side the card is on
 * @param {object} config - Layout config with peek.magnetism
 * @param {object} gates - { isAnimating, navMorph, slug } - disables when truthy, slug triggers re-measure
 * @returns {{ peekX: MotionValue, peekY: MotionValue, leanRotate: MotionValue }}
 */
export function useCursorMagnetism(cardRef, side, config, gates = {}) {
  const { isAnimating, navMorph, slug } = gates
  const magnetism = config.peek?.magnetism

  // Cached rect — measured on mount, resize, and when slug/gates change
  const rectRef = useRef(null)
  const centerXRef = useRef(0)
  const centerYRef = useRef(0)

  // Raw strength value (0–1) before springs
  const rawStrength = useMotionValue(0)
  // Raw cursor displacement (for Y tracking)
  const rawDisplacementY = useMotionValue(0)

  // Previous strength for asymmetric spring detection
  const prevStrengthRef = useRef(0)
  const springConfigRef = useRef(magnetism?.springExit || { stiffness: 80, damping: 26 })

  // Media query gate: only enable on hover-capable pointer devices
  const canHoverRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateHover = () => { canHoverRef.current = hoverQuery.matches }
    const updateMotion = () => { prefersReducedMotionRef.current = motionQuery.matches }

    updateHover()
    updateMotion()

    hoverQuery.addEventListener('change', updateHover)
    motionQuery.addEventListener('change', updateMotion)

    return () => {
      hoverQuery.removeEventListener('change', updateHover)
      motionQuery.removeEventListener('change', updateMotion)
    }
  }, [])

  // Ensure shared listener exists
  useEffect(() => {
    return ensureSharedListener()
  }, [])

  // Measure rect when card or conditions change
  useLayoutEffect(() => {
    if (!cardRef.current || !magnetism) return

    const measure = () => {
      const rect = cardRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0) {
        rectRef.current = null
        return
      }

      rectRef.current = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      }
      centerXRef.current = (rect.left + rect.right) / 2
      centerYRef.current = (rect.top + rect.bottom) / 2
    }

    measure()

    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  }, [cardRef, magnetism, slug])

  // Update strength on every frame based on cursor position
  useEffect(() => {
    if (!magnetism) return

    let rafId = null

    const update = () => {
      // Try to measure rect if we don't have one yet (handles delayed ref attachment)
      if (!rectRef.current && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        if (rect && rect.width > 0) {
          rectRef.current = {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          }
          centerXRef.current = (rect.left + rect.right) / 2
          centerYRef.current = (rect.top + rect.bottom) / 2
        }
      }

      // Gate conditions
      if (
        !canHoverRef.current ||
        prefersReducedMotionRef.current ||
        isAnimating ||
        navMorph ||
        !rectRef.current
      ) {
        if (rawStrength.get() !== 0) rawStrength.set(0)
        rafId = requestAnimationFrame(update)
        return
      }

      const distance = distanceToRect(
        sharedCursorX,
        sharedCursorY,
        rectRef.current,
        magnetism.distanceWeightY ?? 0.4
      )

      const radius = magnetism.radius ?? 400
      const t = Math.max(0, Math.min(1, 1 - distance / radius))
      const strength = smoothstep(t)

      // Calculate Y displacement from card center (cursor following)
      const displacementY = sharedCursorY - centerYRef.current
      const yGain = magnetism.verticalGain ?? 0.3
      const scaledY = displacementY * yGain

      // Update spring config if direction changed
      const prev = prevStrengthRef.current
      if (strength > prev && springConfigRef.current !== magnetism.springEnter) {
        springConfigRef.current = magnetism.springEnter || { stiffness: 180, damping: 20 }
      } else if (strength < prev && springConfigRef.current !== magnetism.springExit) {
        springConfigRef.current = magnetism.springExit || { stiffness: 80, damping: 26 }
      }
      prevStrengthRef.current = strength

      rawStrength.set(strength)
      rawDisplacementY.set(scaledY)
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [rawStrength, magnetism, isAnimating, navMorph])

  // Spring-smoothed strength with asymmetric config
  const smoothStrength = useSpring(rawStrength, springConfigRef.current)
  const smoothDisplacementY = useSpring(rawDisplacementY, springConfigRef.current)

  // Peek: gain applied on top of the CSS reveal width
  const peekGain = magnetism?.peekGain ?? 60

  const peekX = useTransform(smoothStrength, (strength) => {
    if (!magnetism) return 0
    return strength * peekGain * (side === 'prev' ? 1 : -1)
  })

  // Vertical tracking: cursor displacement scaled by strength
  const peekY = useTransform([smoothStrength, smoothDisplacementY], ([strength, disY]) => {
    if (!magnetism) return 0
    return strength * disY
  })

  // Lean: rotateY with sign based on cursor position relative to card center
  const leanGain = magnetism?.leanGain ?? 8
  const leanCap = magnetism?.leanCap ?? 8

  const leanRotate = useTransform(smoothStrength, (strength) => {
    if (!magnetism || !canHoverRef.current || prefersReducedMotionRef.current) {
      return 0
    }

    if (strength === 0) return 0

    const sign = sharedCursorX > centerXRef.current ? 1 : -1
    const angle = sign * strength * leanGain

    return Math.max(-leanCap, Math.min(leanCap, angle))
  })

  // Under reduced motion there is no magnetism, and each transform above
  // already resolves to 0. Returning fresh motion values from a branch here
  // would call hooks conditionally — and would hand back new objects on every
  // render, detaching whatever was bound to the previous ones.
  return { peekX, peekY, leanRotate }
}
