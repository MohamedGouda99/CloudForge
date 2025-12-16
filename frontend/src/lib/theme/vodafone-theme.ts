/**
 * Vodafone Enterprise Design System
 * Professional color palette and design tokens
 */

export const vodafoneTheme = {
  colors: {
    // Primary Vodafone colors
    primary: {
      red: '#E60000',
      darkRed: '#B20000',
      lightRed: '#FF1A1A',
    },
    // Secondary colors
    secondary: {
      charcoal: '#333333',
      midGrey: '#666666',
      lightGrey: '#999999',
      paleGrey: '#E6E6E6',
    },
    // Functional colors
    functional: {
      success: '#00A650',
      warning: '#FF9900',
      error: '#E60000',
      info: '#0066CC',
    },
    // Backgrounds
    background: {
      primary: '#FFFFFF',
      secondary: '#F7F7F7',
      tertiary: '#E6E6E6',
      dark: '#1A1A1A',
    },
    // Text
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
  },
  
  typography: {
    fontFamily: {
      primary: "'Vodafone Rg', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

export type VodafoneTheme = typeof vodafoneTheme;

