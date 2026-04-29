/**
 * Runtime tokens for SVG, canvas, charts, and inline styles.
 * Keep in sync with `tokens.css` @theme values.
 */
export const tokens = {
  colors: {
    fg: {
      default: '#f7fbff',
      primary: '#eef6ff',
      secondary: '#b2bfcc',
      muted: '#788898',
      label: '#7f8b98',
      ghost: '#94a3b8',
    },
    surface: {
      page: '#0a0f15',
      shell: '#070b10',
      app: '#0b1118',
      appDeep: '#080c12',
      viewer: '#0b0f15',
      elevated: '#101820',
      inverse: '#05080d',
      inverseMuted: '#151d27',
      chartTint: '#111d2b',
    },
    border: {
      default: 'rgb(255 255 255 / 0.1)',
      muted: 'rgb(255 255 255 / 0.06)',
    },
    accent: {
      blue: '#465ff1',
      danger: '#e74c3c',
      coral: '#ff5744',
      success: '#27ae60',
      warning: '#f39c12',
      amber: '#f1c40f',
    },
    chart: {
      bar: '#2dd4bf',
      line: '#6ee7ff',
    },
  },
  shadow: {
    glass: '0 18px 48px rgba(0,0,0,0.28)',
    glassLg: '0 28px 80px rgba(0,0,0,0.38)',
    floating: '0 24px 80px rgba(0,0,0,0.42)',
  },
  radius: {
    glass: '2px',
    panel: '16px',
    control: '0.75rem',
  },
  typography: {
    fontSans:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

export type TokenColors = typeof tokens.colors
