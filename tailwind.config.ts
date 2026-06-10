import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#3b6cf6',
        'accent-dark': '#2b54d4',
        'accent-soft': '#eaf0ff',
        green: { DEFAULT: '#16a06a', soft: '#e6f6ee' },
        red: { DEFAULT: '#e5604b', soft: '#fdecea' },
        amber: { DEFAULT: '#e0972b', soft: '#fbf2e1' },
        purple: '#7c5cfc',
        surface: '#ffffff',
        surface2: '#f7f9fc',
        surface3: '#eef2f7',
        border: '#e6eaf0',
        'border-strong': '#d6dce5',
        muted: '#9aa7b8',
        dim: '#5e6b7e',
        faint: '#98a3b3',
        bg: '#f4f6fa',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        sm: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,.07), 0 1px 2px rgba(16,24,40,.04)',
        'card-hover': '0 6px 18px rgba(16,24,40,.08)',
        sm: '0 1px 2px rgba(16,24,40,.04)',
      },
    },
  },
  plugins: [],
}

export default config
