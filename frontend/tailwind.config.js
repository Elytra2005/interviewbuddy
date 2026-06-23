/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // OLED dark design system
        bg: {
          base:    '#020617',   // page background
          raised:  '#0B1120',   // card surface
          overlay: '#111827',   // dropdown / modal
          muted:   '#1E293B',   // subtle fills
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          base:   'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        accent: {
          DEFAULT: '#00ea64',
          dark:    '#00c454',
          light:   '#33ef83',
        },
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        risk: {
          low:    '#22c55e',
          medium: '#f59e0b',
          high:   '#f97316',
          vhigh:  '#ef4444',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 24px -4px rgba(99,102,241,.4)',
        'glow-red':   '0 0 24px -4px rgba(239,68,68,.35)',
        'card':       '0 1px 3px rgba(0,0,0,.4), 0 4px 16px rgba(0,0,0,.3)',
      },
      animation: {
        'fade-in':   'fadeIn .15s ease-out',
        'slide-down':'slideDown .15s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
