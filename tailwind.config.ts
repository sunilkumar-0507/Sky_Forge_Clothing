import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0F0F0F', soft: '#2A2826' },
        bone: { DEFAULT: '#F2EFE9', dark: '#E7E2D9' },
        ember: { DEFAULT: '#D9542B', dark: '#B8431F', light: '#F3B59E' },
        sky: { DEFAULT: '#9DB8D6' },
        muted: '#8A857C',
        line: '#D9D3C8',
      },
      fontFamily: {
        display: ['"Clash Display"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        mega: ['clamp(2.5rem, min(13vw, 22svh), 13rem)', { lineHeight: '0.86', letterSpacing: '-0.04em' }],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'slow-zoom': { from: { transform: 'scale(1.15)' }, to: { transform: 'scale(1)' } },
        'scroll-dot': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translateY(18px)', opacity: '0' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'slow-zoom': 'slow-zoom 14s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scroll-dot': 'scroll-dot 1.8s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
