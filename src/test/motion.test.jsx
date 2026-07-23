import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { MotionConfig, LazyMotion, domMax, m } from 'motion/react'
import { FadeIn, Stagger, StaggerItem, usePresenceDirection } from '../motion'

/**
 * Motion Integration Tests
 *
 * Verifies that Motion is properly configured and working:
 * - MotionConfig with reducedMotion="user"
 * - LazyMotion with domMax features
 * - Basic animations render without errors
 * - Motion primitives work correctly
 */

// Test wrapper with Motion configuration matching main.jsx
function TestWrapper({ children }) {
  return (
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domMax} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </StrictMode>
  )
}

describe('Motion Integration', () => {
  test('MotionConfig and LazyMotion are properly configured', () => {
    const { container } = render(
      <TestWrapper>
        <m.div data-testid="motion-test">Motion works</m.div>
      </TestWrapper>
    )

    const motionElement = screen.getByTestId('motion-test')
    expect(motionElement).toBeInTheDocument()
    expect(motionElement).toHaveTextContent('Motion works')
  })

  test('m component renders with animate prop', async () => {
    render(
      <TestWrapper>
        <m.div
          data-testid="animated-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          Animated content
        </m.div>
      </TestWrapper>
    )

    const animatedBox = screen.getByTestId('animated-box')
    expect(animatedBox).toBeInTheDocument()

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(animatedBox).toHaveTextContent('Animated content')
      },
      { timeout: 1000 }
    )
  })

  test('domMax features support drag gestures', () => {
    render(
      <TestWrapper>
        <m.div
          data-testid="draggable"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
        >
          Draggable
        </m.div>
      </TestWrapper>
    )

    const draggable = screen.getByTestId('draggable')
    expect(draggable).toBeInTheDocument()
    // If domMax is missing, drag prop would cause errors
  })
})

describe('Motion Primitives', () => {
  test('FadeIn component renders and accepts props', () => {
    render(
      <TestWrapper>
        <FadeIn data-testid="fade-in" y={20}>
          <p>Fading content</p>
        </FadeIn>
      </TestWrapper>
    )

    const fadeIn = screen.getByTestId('fade-in')
    expect(fadeIn).toBeInTheDocument()
    expect(fadeIn).toHaveTextContent('Fading content')
  })

  test('Stagger and StaggerItem components render', () => {
    render(
      <TestWrapper>
        <Stagger stagger={100} data-testid="stagger-container">
          <StaggerItem data-testid="item-1">Item 1</StaggerItem>
          <StaggerItem data-testid="item-2">Item 2</StaggerItem>
          <StaggerItem data-testid="item-3">Item 3</StaggerItem>
        </Stagger>
      </TestWrapper>
    )

    expect(screen.getByTestId('stagger-container')).toBeInTheDocument()
    expect(screen.getByTestId('item-1')).toHaveTextContent('Item 1')
    expect(screen.getByTestId('item-2')).toHaveTextContent('Item 2')
    expect(screen.getByTestId('item-3')).toHaveTextContent('Item 3')
  })

  test('usePresenceDirection hook returns state and setter', () => {
    let hookResult

    function TestComponent() {
      hookResult = usePresenceDirection()
      const [direction, setDirection] = hookResult

      return (
        <div>
          <span data-testid="direction">{direction}</span>
          <button onClick={() => setDirection(1)}>Set Forward</button>
          <button onClick={() => setDirection(-1)}>Set Backward</button>
        </div>
      )
    }

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(hookResult).toBeDefined()
    expect(hookResult).toHaveLength(2)
    expect(typeof hookResult[0]).toBe('number')
    expect(typeof hookResult[1]).toBe('function')

    // Initial direction should be 0
    expect(screen.getByTestId('direction')).toHaveTextContent('0')
  })
})

describe('Motion Tokens', () => {
  test('tokens are importable and have correct structure', async () => {
    const { durations, easings, springs, distances } = await import('../motion')

    // Durations
    expect(durations).toBeDefined()
    expect(durations.fast).toBe(150)
    expect(durations.base).toBe(300)

    // Easings
    expect(easings).toBeDefined()
    expect(easings.easeDefault).toEqual([0.4, 0, 0.2, 1])

    // Springs
    expect(springs).toBeDefined()
    expect(springs.slide).toEqual({
      stiffness: 320,
      damping: 34,
    })

    // Distances
    expect(distances).toBeDefined()
    expect(distances.slideOffset).toBe('100vw')
  })
})

describe('Reduced Motion Support', () => {
  test('MotionConfig respects reducedMotion="user" setting', () => {
    // This test verifies the configuration is set correctly
    // Actual reduced motion behavior is tested via user's system preferences
    const { container } = render(
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domMax} strict>
          <m.div data-testid="reduced-motion-test">Content</m.div>
        </LazyMotion>
      </MotionConfig>
    )

    expect(screen.getByTestId('reduced-motion-test')).toBeInTheDocument()
  })
})
