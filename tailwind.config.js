/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6EEFF',
          100: '#CCE2FF',
          200: '#99C7FF',
          300: '#66ABFF',
          400: '#338FFF',
          500: '#0046FF',
          600: '#0039CC',
          700: '#002B99',
          800: '#001D66',
          900: '#001033'
        },
        accent: {
          50: '#FFFBF0',
          100: '#FFF7E0',
          200: '#FFEFC2',
          300: '#FFE7A3',
          400: '#FFDF85',
          500: '#FFC82C',
          600: '#FFAB00',
          700: '#CC8E00',
          800: '#997100',
          900: '#665400'
        },
        surface: '#FFFFFF',
        background: '#F5F5F5',
        dark: {
          surface: '#1E1E1E',
          background: '#121212',
          card: '#2A2A2A'
        }
      },
      fontFamily: {
        display: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        body: ['Spoqa Han Sans Neo', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif']
      },
    },
  },
  plugins: [],
}