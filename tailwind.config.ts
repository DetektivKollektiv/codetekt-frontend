import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"effra"', 'sans-serif'],
        mono: ['"pt-mono"', 'monospace'],
      },
      fontSize: {
        /* Display */
        'display-hero': [
          '4.5rem', // 72px
          {
            lineHeight: '1',
            fontWeight: '900',
            letterSpacing: '-0.09rem',
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
