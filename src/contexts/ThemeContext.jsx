import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme')
    if (stored) return stored

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  useEffect(() => {
    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme)

    // Persist to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * The current theme, for components that only need to read it.
 *
 * Unlike `useTheme` this never throws. Content components — every image in a
 * case study now reads the theme — get rendered in places that have no provider
 * around them: unit tests, and any harness that mounts one block on its own.
 * Losing a whole case study to a missing provider would be a poor trade for a
 * value the document element is already carrying, so outside a provider it
 * falls back to reading `data-theme` off the document.
 *
 * That fallback is a read, not a subscription: it is correct at mount and does
 * not re-render on a later change. Inside the app the provider is always there
 * and the value is reactive, which is what makes the swap happen on toggle.
 */
export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (context) return context.theme

  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  }

  return 'light'
}
