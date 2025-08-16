/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Organic tree-library theme colors
        bark: {
          50: '#faf8f5',
          100: '#f5f1ea',
          200: '#e8ddd0',
          300: '#d9c7b1',
          400: '#c7ab8f',
          500: '#b8926f',
          600: '#a67c5a',
          700: '#8a654a',
          800: '#6f523e',
          900: '#5a4334',
        },
        leaf: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd18f',
          400: '#5cb85c',
          500: '#3a9b3a',
          600: '#2d7d2d',
          700: '#256325',
          800: '#1f4f1f',
          900: '#1a411a',
        },
        root: {
          50: '#f7f4f0',
          100: '#ede6db',
          200: '#dccbb8',
          300: '#c5a88f',
          400: '#b08968',
          500: '#9c7049',
          600: '#85593d',
          700: '#6e4833',
          800: '#5a3c2d',
          900: '#4a3226',
        },
        wisdom: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8fd18f',
          400: '#5cb85c',
          500: '#3a9b3a',
          600: '#2d7d2d',
          700: '#256325',
          800: '#1f4f1f',
          900: '#1a411a',
        },
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0d1117',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'leaf-rustle': 'leafRustle 3s ease-in-out infinite',
        'branch-extend': 'branchExtend 2s ease-out',
        'wisdom-glow': 'wisdomGlow 2s ease-in-out infinite alternate',
        'organic-pulse': 'organicPulse 3s ease-in-out infinite',
      },
      keyframes: {
        leafRustle: {
          '0%, 100%': { transform: 'rotate(-2deg) scale(1)' },
          '50%': { transform: 'rotate(2deg) scale(1.02)' },
        },
        branchExtend: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        wisdomGlow: {
          '0%': { boxShadow: '0 0 5px rgba(234, 179, 8, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.6)' },
        },
        organicPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
      borderRadius: {
        'organic': '1.5rem',
        'branch': '2rem 0.5rem 2rem 0.5rem',
      },
      boxShadow: {
        'organic': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'leaf': '0 4px 14px 0 rgba(58, 155, 58, 0.15)',
        'bark': '0 4px 14px 0 rgba(138, 101, 74, 0.15)',
      },
      backgroundImage: {
        'tree-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f9f0' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'organic-gradient': 'linear-gradient(135deg, #f0f9f0 0%, #dcf2dc 25%, #bce5bc 50%, #8fd18f 75%, #5cb85c 100%)',
      },
    },
  },
  plugins: [],
}
