import plugin from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"effra"', 'sans-serif'],
        mono: ['"pt-mono"', 'monospace'],
      },
      fontSize: {
        /* Display */
        'display-lg': [
          '4.5rem', // 72px
          {
            lineHeight: '1',
            fontWeight: '900',
            letterSpacing: '-0.09rem',
          },
        ],

        'display-md': [
          '3rem', // 48px
          {
            lineHeight: '1.05',
            fontWeight: '900',
            letterSpacing: '-0.06rem',
          },
        ],

        'display-sm': [
          '2.25rem', // 36px
          {
            lineHeight: '1.1',
            fontWeight: '900',
            letterSpacing: '-0.03rem',
          },
        ],
        'display-eyebrow': [
          '0.75rem', // 12px
          {
            lineHeight: '1.05',
            fontWeight: '500',
            letterSpacing: '0.13125rem',
          },
        ],
        /* Headings */
        'heading-xl': [
          '2rem', // 32px
          { lineHeight: '1.2', fontWeight: '600' },
        ],
        'heading-lg': [
          '1.5rem', // 24px
          { lineHeight: '1.25', fontWeight: '600' },
        ],
        'heading-md': [
          '1.25rem', // 20px
          { lineHeight: '1.3', fontWeight: '600' },
        ],
        'heading-sm': [
          '1.125rem', // 18px
          { lineHeight: '1.35', fontWeight: '600' },
        ],

        /* Body */
        'body-md': [
          '1rem', // 16px
          { lineHeight: '1.6', fontWeight: '400' },
        ],
        'body-sm': [
          '0.875rem', // 14px
          { lineHeight: '1.5', fontWeight: '400' },
        ],

        /* Meta */
        meta: [
          '0.75rem', // 12px
          { lineHeight: '1.4', fontWeight: '500' },
        ],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          border: 'hsl(var(--secondary-border))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Brand colors
        brand: {
          darkblue: 'hsl(var(--brand-darkblue))',
          purple: {
            DEFAULT: 'hsl(var(--brand-purple))',
            light: 'hsl(var(--brand-purple-light))',
            dark: 'hsl(var(--brand-purple-dark))',
          },
          yellow: {
            DEFAULT: 'hsl(var(--brand-yellow))',
            light: 'hsl(var(--brand-yellow-light))',
            dark: 'hsl(var(--brand-yellow-dark))',
          },
          orange: {
            DEFAULT: 'hsl(var(--brand-orange))',
            light: 'hsl(var(--brand-orange-light))',
            dark: 'hsl(var(--brand-orange-dark))',
          },
          green: {
            DEFAULT: 'hsl(var(--brand-green))',
            light: 'hsl(var(--brand-green-light))',
            dark: 'hsl(var(--brand-green-dark))',
          },
          coral: {
            DEFAULT: 'hsl(var(--brand-coral))',
            light: 'hsl(var(--brand-coral-light))',
            dark: 'hsl(var(--brand-coral-dark))',
          },
          gray: 'hsl(var(--brand-gray))',
        },
        // Neutral/Gray scale
        neutral: {
          0: 'hsl(var(--neutral-0))',
          50: 'hsl(var(--neutral-50))',
          100: 'hsl(var(--neutral-100))',
          200: 'hsl(var(--neutral-200))',
          300: 'hsl(var(--neutral-300))',
          400: 'hsl(var(--neutral-400))',
          500: 'hsl(var(--neutral-500))',
          600: 'hsl(var(--neutral-600))',
          700: 'hsl(var(--neutral-700))',
          800: 'hsl(var(--neutral-800))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [plugin],
};

export default config;
