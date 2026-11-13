/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F0E7',
        'paper-deep': '#EAE4D6',
        ink: '#242522',
        'ink-soft': '#33342F',
        graphite: '#A8A397',
        'graphite-dark': '#6F6B61',
        rust: '#D98252',
        'rust-dark': '#A9552A',
        sage: '#8DA58A',
        'sage-dark': '#4F6A4C',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Newsreader', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.18em',
      },
    },
  },
  plugins: [],
};
