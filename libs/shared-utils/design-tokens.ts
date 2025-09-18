// Design System Tokens for Tree of Life Agency
export const designTokens = {
  // Color Palette
  colors: {
    // Primary brand colors
    leaf: {
      50: '#f0f9f0',
      100: '#dcf2dc',
      200: '#bce5bc',
      300: '#8fd18f',
      400: '#5cb85c',
      500: '#3a9b3a',
      600: '#2d7d2d',
      700: '#1f4f1f',
    },
    bark: {
      50: '#faf9f7',
      100: '#f5f3f0',
      200: '#e8e4de',
      300: '#d4cfc5',
      400: '#a8a196',
      500: '#8b7f6f',
      600: '#6b5f4f',
      700: '#4a3f2f',
      800: '#2d241a',
    },
    root: {
      50: '#fdf8f3',
      100: '#f9ede0',
      200: '#f0d9c0',
      300: '#e4c19a',
      400: '#d4a574',
      500: '#c4894e',
      600: '#a66d28',
    },
    wisdom: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },

  // Border Radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    organic: '1rem',
    branch: '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    organic: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    leaf: '0 20px 25px -5px rgb(58 155 58 / 0.1), 0 8px 10px -6px rgb(58 155 58 / 0.1)',
    bark: '0 20px 25px -5px rgb(107 95 79 / 0.1), 0 8px 10px -6px rgb(107 95 79 / 0.1)',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const

export type DesignTokens = typeof designTokens
