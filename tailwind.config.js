const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Saira"', 'sans-serif', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'moving-gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '50% 100%' },
        },
        'drift-fast': {
          '0%': { opacity: '0.1', transform: 'translateY(0px) translateX(0px) scale(0.5)', boxShadow: '0 0 2px rgba(233, 213, 255, 0.3)' },
          '50%': { opacity: '0.9', transform: 'translateY(-40px) translateX(15px) scale(1.2)', boxShadow: '0 0 8px rgba(233, 213, 255, 0.8)' },
          '100%': { opacity: '0.1', transform: 'translateY(-80px) translateX(-10px) scale(0.6)', boxShadow: '0 0 3px rgba(233, 213, 255, 0.3)' },
        },
        'drift-medium': {
          '0%': { opacity: '0.2', transform: 'translateY(0px) translateX(0px) scale(0.6)', boxShadow: '0 0 3px rgba(233, 213, 255, 0.3)' },
          '50%': { opacity: '0.8', transform: 'translateY(-60px) translateX(-20px) scale(1.1)', boxShadow: '0 0 6px rgba(233, 213, 255, 0.7)' },
          '100%': { opacity: '0.2', transform: 'translateY(-120px) translateX(20px) scale(0.5)', boxShadow: '0 0 2px rgba(233, 213, 255, 0.3)' },
        },
        'drift-slow': {
          '0%': { opacity: '0.1', transform: 'translateY(0px) translateX(0px) scale(0.7)', boxShadow: '0 0 4px rgba(233, 213, 255, 0.4)' },
          '50%': { opacity: '0.7', transform: 'translateY(-90px) translateX(30px) scale(1.3)', boxShadow: '0 0 10px rgba(233, 213, 255, 0.9)' },
          '100%': { opacity: '0.1', transform: 'translateY(-180px) translateX(-25px) scale(0.7)', boxShadow: '0 0 4px rgba(233, 213, 255, 0.4)' },
        },
        'orb-rotate-1': {
          '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate(40px, 50px) scale(1.15) rotate(180deg)' },
          '100%': { transform: 'translate(0, 0) scale(1) rotate(360deg)' },
        },
        'orb-rotate-2': {
          '0%': { transform: 'translate(0, 0) scale(1) rotate(360deg)' },
          '50%': { transform: 'translate(-50px, -40px) scale(1.2) rotate(180deg)' },
          '100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
        },
        'orb-rotate-3': {
          '0%': { transform: 'translate(-50%, -50%) translate(-30px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(-50%, -50%) translate(30px, -20px) scale(1.1)' },
        },
      },
      animation: {
        'moving-gradient': 'moving-gradient 18s ease infinite alternate',
        'drift-fast': 'drift-fast 6s ease-in-out infinite alternate',
        'drift-medium': 'drift-medium 9s ease-in-out infinite alternate',
        'drift-slow': 'drift-slow 12s ease-in-out infinite alternate',
        'orb-rotate-1': 'orb-rotate-1 25s linear infinite',
        'orb-rotate-2': 'orb-rotate-2 30s linear infinite',
        'orb-rotate-3': 'orb-rotate-3 20s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
