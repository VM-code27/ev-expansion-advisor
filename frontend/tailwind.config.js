/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Non-standard opacity steps used throughout the UI
    'bg-white/[0.04]', 'bg-white/[0.07]', 'bg-white/[0.08]',
    'border-white/[0.08]',
    'bg-green-500/[0.15]', 'bg-red-500/[0.15]', 'bg-yellow-500/[0.15]',
    'bg-blue-500/[0.04]', 'bg-green-500/[0.04]', 'bg-purple-500/[0.04]',
    'hover:bg-white/[0.08]',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
