/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        // Golden Hour · acento primario (mostaza/dorado)
        marca: {
          50: '#fdf9ec',
          100: '#faedc6',
          200: '#f6dc8c',
          300: '#f2c84e',
          400: '#f4b51d',
          500: '#f4a900',
          600: '#d18a00',
          700: '#a76803',
          800: '#84520c',
          900: '#6e4410',
          950: '#402506',
        },
        // Golden Hour · secundario (terracota) — acciones cálidas / ocupado
        terra: {
          50: '#fbf2f2',
          100: '#f6e1e2',
          200: '#efc8ca',
          300: '#e2a3a6',
          400: '#d17d82',
          500: '#c1666b',
          600: '#a44e53',
          700: '#883f43',
          800: '#71373a',
          900: '#603134',
          950: '#341819',
        },
        // Golden Hour · neutro cálido (beige/arena) — superficies y bordes
        arena: {
          50: '#faf7f1',
          100: '#f2ebdc',
          200: '#e7d7bb',
          300: '#d4b896',
          400: '#c39e75',
          500: '#b6885d',
          600: '#a87350',
          700: '#8b5c43',
          800: '#724c3b',
          900: '#5e4032',
          950: '#332115',
        },
        // Golden Hour · oscuro (chocolate) — texto y anclas
        cacao: {
          50: '#f7f5f3',
          100: '#ebe7e3',
          200: '#d8d0ca',
          300: '#bdb1a8',
          400: '#9d8d82',
          500: '#837368',
          600: '#6b5d54',
          700: '#574b44',
          800: '#4a403a',
          900: '#3a322e',
          950: '#221d1a',
        },
      },
    },
  },
  plugins: [],
}
