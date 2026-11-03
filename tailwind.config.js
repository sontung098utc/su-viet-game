/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FAF7F0',
          100: '#F5EFE1',
          200: '#EBDDC1',
          300: '#DEC59C',
          400: '#CFA872',
          500: '#B88B4B',
          600: '#946B34',
          700: '#6E4D25',
          800: '#4D3418',
          900: '#2C1D0E',
        },
        lacquer: {
          light: '#4A2F22',
          DEFAULT: '#2F1B12',
          dark: '#1C0F0A',
        },
        crimson: {
          light: '#C43D38',
          DEFAULT: '#9B1D20',
          dark: '#681113',
        },
        river: {
          50: '#EFF8FA',
          100: '#D5EFF4',
          200: '#A9DEE9',
          300: '#75C3D6',
          400: '#3EA2BD',
          500: '#237B96',
          600: '#1B637B',
          700: '#184F63',
          800: '#174252',
          900: '#102F3B',
        },
        bronze: {
          light: '#ECC662',
          DEFAULT: '#C99726',
          dark: '#8E6712',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'scroll': '0 10px 25px -5px rgba(47, 27, 18, 0.3), 0 8px 10px -6px rgba(47, 27, 18, 0.2)',
        'artifact': '0 0 20px 2px rgba(201, 151, 38, 0.4)',
      }
    },
  },
  plugins: [],
}
