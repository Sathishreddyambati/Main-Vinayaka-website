import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#17130F',
          50: '#2A231C',
          100: '#211B15',
        },
        ivory: {
          DEFAULT: '#F7F1E4',
          dim: '#EDE4CF',
        },
        maroon: {
          DEFAULT: '#6B1420',
          light: '#8C2130',
          dark: '#4A0D16',
        },
        saffron: {
          DEFAULT: '#E08A2C',
          light: '#F0A94E',
        },
        copper: {
          DEFAULT: '#B9863F',
          light: '#D9AE71',
        },
        ember: '#F4C77B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-glow':
          'radial-gradient(60% 50% at 50% 40%, rgba(244,199,123,0.16) 0%, rgba(23,19,15,0) 70%)',
        'vignette':
          'radial-gradient(120% 90% at 50% 20%, transparent 40%, #17130F 100%)',
      },
      keyframes: {
        ember: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-140px) translateX(12px)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '45%': { opacity: '0.85', filter: 'brightness(0.92)' },
          '55%': { opacity: '1', filter: 'brightness(1.08)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ember: 'ember 4.5s ease-in infinite',
        flicker: 'flicker 3.2s ease-in-out infinite',
        'pulse-live': 'pulse-live 1.8s ease-in-out infinite',
        rise: 'rise 0.7s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
