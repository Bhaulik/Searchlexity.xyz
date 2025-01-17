/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'perplexity-bg': '#0F0F0F',
        'perplexity-card': '#1E1E1E',
        'perplexity-hover': '#2C2C2C',
        'perplexity-text': '#FFFFFF',
        'perplexity-muted': '#888888',
        'perplexity-accent': '#8C61FF',
        'perplexity-primary': '#8C61FF',
        'perplexity-primary-dark': '#7040FF',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slow-fade-in': 'fade-in 1s ease-in-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    import('@tailwindcss/typography'),
  ],
}