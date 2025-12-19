import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#27AE60',
        secondary: '#F2994A',
        accent: '#9B51E0',
      },
      fontFamily: {
        sans: ['"Microsoft Yahei"', '"Hiragino Sans GB"', '"Heiti SC"', '"WenQuanYi Micro Hei"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('windicss/plugin/scrollbar'),
  ],
})