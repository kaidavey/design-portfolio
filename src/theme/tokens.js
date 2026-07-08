/**
 * Design Tokens for Paper-generated Components
 *
 * These tokens map visual decisions to semantic names.
 * Paper should generate components that reference these tokens
 * rather than hardcoding values.
 */

export const tokens = {
  // Typography
  fonts: {
    sans: "font-['DM_Sans',system-ui,sans-serif]",
  },

  fontSizes: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 28px (currently text-[28px])
  },

  fontWeights: {
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
  },

  lineHeights: {
    tight: 'leading-tight',     // 1.25
    snug: 'leading-snug',       // 1.375
    normal: 'leading-normal',   // 1.5
    relaxed: 'leading-relaxed', // 1.625
  },

  letterSpacing: {
    tighter: 'tracking-tighter', // -0.05em
    tight: 'tracking-tight',     // -0.025em
    normal: 'tracking-normal',   // 0
  },

  // Colors
  colors: {
    // Text colors
    textPrimary: 'text-black',
    textSecondary: 'text-[#2F2F2F]',  // Dark gray
    textMuted: 'text-[#0000004D]',     // 30% black
    textError: 'text-red-500',

    // Background colors
    bgWhite: 'bg-white',
    bgGray: 'bg-[#F2F2F2]',           // Light gray background
    bgGrayDark: 'bg-gray-100',

    // Border colors
    borderGray: 'border-[#DEDEDE]',   // Border gray
    borderGrayLight: 'border-[#E0E0E0]',
    borderGrayDark: 'border-gray-200',
  },

  // Spacing
  spacing: {
    xs: 'gap-1',    // 4px
    sm: 'gap-2',    // 8px
    md: 'gap-4',    // 16px
    lg: 'gap-6',    // 24px
    xl: 'gap-8',    // 32px
    '2xl': 'gap-16', // 64px
  },

  // Border radius
  radii: {
    sm: 'rounded-lg',     // 8px
    md: 'rounded-xl',     // 12px
    lg: 'rounded-[20px]', // 20px (current standard)
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    inner: '[box-shadow:#FFFFFF_-1px_2px_0px_inset]', // Current inset shadow
  },

  // Container breakpoints (for documentation)
  // Use @md:, @lg:, @xl: in className strings
  containerBreakpoints: {
    sm: '@sm:',   // 640px
    md: '@md:',   // 768px
    lg: '@lg:',   // 1024px
    xl: '@xl:',   // 1280px
  },
}

/**
 * Helper to get token value
 * Usage: getToken('colors.textPrimary') => 'text-black'
 */
export function getToken(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], tokens)
}
