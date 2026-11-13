export default {
  darkMode: 'class', // Enables class-based dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Stellar-inspired brand thematics
        stellar: {
          black: '#0F0F0F',
          offwhite: '#F9F9F9',
          gray: '#969696',
          yellow: '#FDDA24',
          orange: '#FF3F00',
          teal: '#00A7B5',
        },
        // SwiftSend core, tuned to blend with Stellar contrast
        swift: {
          navy: '#0B1F4B',
          blue: '#0284C7',
          blueDark: '#0369A1',
          sky: '#7DD3FC',
        },
      },
    },
  },
  plugins: [],
}
