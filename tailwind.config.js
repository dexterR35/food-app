export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        food: {
          bg:           'var(--food-bg)',
          card:         'var(--food-card)',
          elevated:     'var(--food-elevated)',
          overlay:      'var(--food-overlay)',
          border:       'var(--food-border)',
          'border-h':   'var(--food-border-h)',
          accent:       'var(--food-accent)',
          'accent-h':   'var(--food-accent-h)',
          'accent-d':   'var(--food-accent-d)',
          'accent-glow': 'var(--food-accent-glow)',
          crimson:      'var(--food-crimson)',
          'crimson-h':  'var(--food-crimson-h)',
          'crimson-d':  'var(--food-crimson-d)',
          green:        'var(--food-green)',
          'green-h':    'var(--food-green-h)',
          'green-d':    'var(--food-green-d)',
          text:         'var(--food-text)',
          'text-s':     'var(--food-text-s)',
          'text-m':     'var(--food-text-m)',
          'text-inv':   'var(--food-text-inv)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: {
        sm:   'var(--r-sm)',
        md:   'var(--r-md)',
        lg:   'var(--r-lg)',
        xl:   'var(--r-xl)',
        full: 'var(--r-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        lg:   'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
    },
  },
}
