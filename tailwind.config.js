/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          foil: '#8C6D3B', // PDF Antique Gold Foil
          light: '#B8934E',
          DEFAULT: '#8C6D3B',
          dark: '#73582D',
          deep: '#5A4421',
        },
        vellum: {
          bone: '#FAFAFA', // PDF Bone-White Base Field
          light: '#FAF7F2', // PDF Base Neutral Clarity
          DEFAULT: '#F2ECE1', // PDF Deep Vellum
          aged: '#EAE1D2',
          border: '#D8CCA8',
        },
        charcoal: {
          DEFAULT: '#1A1817', // PDF Primary Framing & Line Art
          slate: '#2B2927', // PDF Slate Black
          muted: '#5C5650',
          light: '#827A73',
        },
        crimson: {
          DEFAULT: '#7A1C1C', // PDF Crimson Red
          light: '#9E2424',
          dark: '#5C1414',
        },
        cosmos: {
          void: '#FAF7F2', // Mapped Base Field
          navy: '#F2ECE1', // Mapped Deep Vellum
          midnight: '#EBE3D5', // Mapped Warm Sand / Panel Vellum
          purple: '#E2D7C3', // Mapped Warm Divider
          card: '#FFFDF9', // Mapped Pristine Card Surface
          border: 'rgba(140, 109, 59, 0.28)', // Antique Gold Foil Border
          glow: 'rgba(140, 109, 59, 0.15)',
        },
        ivory: '#1A1817', // High-contrast readable charcoal text
        mute: '#6B635B', // Warm muted charcoal secondary
        starlight: '#8C6D3B', // Antique Gold Foil Accent
        suit: {
          dharma: '#2B2927', // Spades ♠ (Slate Black)
          artha: '#7A1C1C', // Diamonds ♦ (Crimson Red)
          kama: '#7A1C1C', // Hearts ♥ (Crimson Red)
          moksha: '#2B2927', // Clubs ♣ (Slate Black)
          master: '#8C6D3B', // Master Keys ✦ (Antique Gold Foil)
        },
      },
      fontFamily: {
        cinzel: ['"Cinzel"', '"Cinzel Decorative"', 'Georgia', 'serif'],
        serif: ['"Cinzel"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-subtle': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
