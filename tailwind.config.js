/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        '#06080F',
        'bg-1':    '#0A0D17',
        'bg-2':    '#11151F',
        surface:   '#161A26',
        'surface-2':'#1D2231',
        ink:       '#EFEAE0',
        'ink-2':   '#A8A395',
        'ink-3':   '#6E6A60',
        'ink-4':   '#4A463E',
        accent:    '#C9A66B',
        'accent-2':'#E2C089',
        good:      '#8DC5A0',
        warn:      '#E0B07B',
        bad:       '#D88884',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'mono-wide': '0.16em',
        'mono-wider':'0.22em',
      },
      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      animation: {
        'pulse-dot': 'pulseDot 4s ease-in-out infinite',
        'node-pulse':'nodePulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        pulseDot:  { '0%,100%': { opacity:1, transform:'scale(1)' }, '50%':{ opacity:0.4, transform:'scale(0.85)' } },
        nodePulse: { '0%,100%': { opacity:0.85, transform:'scale(1)' }, '50%':{ opacity:0.4, transform:'scale(0.7)' } },
      },
      backdropBlur: { 'xs': '4px' },
    },
  },
  plugins: [],
};
