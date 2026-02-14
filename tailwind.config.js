/** @type {import('tailwindcss').Config} */
const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  // زودتلك app و components عشان لو بتستخدم Expo Router
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,tsx,ts,jsx}',
  ],
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      // 1. تعريف الألوان


      colors: {

        main: {
          50: '#FCEEE3',
          100: '#FBEADC',
          200: '#FAE5D3',
          300: '#F9DFC8',
          400: '#F7D7BA',
          500: '#F5CDA9',
          600: '#F3C194',
          700: '#F0B279',
          800: '#EC9F58',
          900: '#E7872E',
          950: '#E57B1A',
        },
        garage: {
          50: '#FAFAFA',
          100: '#EFEFEF',
          200: '#DCDCDC',
          300: '#BDBDBD',
          400: '#989898',
          500: '#7C7C7C',
          600: '#656565',
          700: '#525252',
          800: '#383838',
          900: '#161616',
          950: '#000000',
        },
        danger: {
          50: '#FDE4E4',
          100: '#FDDDDD',
          200: '#FDD4D4',
          300: '#FDC9C9',
          400: '#FCBCBC',
          500: '#FBABAB',
          600: '#FA9696',
          700: '#F97C7C',
          800: '#F75B5B',
          900: '#F53232',
          950: '#F41F1F',
        },

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },

      future: {
        hoverOnlyWhenSupported: true,
      },



      // 2. تعريف الخطوط
      // لاحظ: الاسم اللي هنا هو اللي هتكتبه في className (مثلا font-titillium)
      // والقيمة اللي جوه المصفوفة هي اسم الخط اللي حملته في useFonts
      fontFamily: {
        titillium: ['Titillium_Reg'],
        'titillium-bold': ['Titillium_Bold'],
        'titillium-light': ['Titillium_Light'],
        'titillium-semibold': ['Titillium_SemiBold'],
        'titillium-black': ['Titillium_Black'],
        'titillium-extralight': ['Titillium_ExtraLight'],
      },
    },
  },
  plugins: [],
}