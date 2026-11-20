export default {
  darkMode: 'class', // Enables class-based dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Stellar-inspired brand thematics
        stellar: {
          black: '#0F0F0F',
          offwhite: '#F8F7F3',
          gray: '#969696',
          yellow: '#E4B638',
          orange: '#C99316',
          teal: '#B88712',
        },
        // SwiftSend core, tuned to blend with Stellar contrast
        swift: {
          navy: '#171717',
          blue: '#A7790C',
          blueDark: '#8A650B',
          sky: '#F1CF72',
        },
      },
    },
  },
  plugins: [],
}
