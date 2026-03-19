export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        food: {
          bg:       '#0a0f0a',
          card:     '#111811',
          elevated: '#1a2a1a',
          border:   '#1a4d1a',
          accent:   '#22c55e',
          'accent-h': '#16a34a',
          'accent-d': '#14532d',
          text:     '#f0fdf4',
          'text-s': '#86efac',
          'text-m': '#4ade80',
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      boxShadow: {
        card: '0 0 0 1px #1a4d1a, 0 4px 24px rgba(0,0,0,0.4)',
      }
    }
  }
}
