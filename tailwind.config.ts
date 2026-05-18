import type { Config } from 'tailwindcss'
import tokens from './tokens.json'
import { shadows, breakpoints, layout } from './styles/design-tokens'

const BRAND = 'TGR' as const
const c = tokens.colors
const t = tokens.typography
const r = tokens.radius

function typeStyle(scale: keyof typeof t) {
  const entry = t[scale]
  return [`${entry.fontSize[BRAND]}px`, { lineHeight: `${entry.lineHeight[BRAND]}px` }] as const
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors (default theme: TGR) ─────────────────────────────────────
      colors: {
        brand: {
          primary: c.brand.primary[BRAND],
          secondary: c.brand.secondary[BRAND],
        },
        surface: {
          primary: c.surface.primary[BRAND],
          secondary: c.surface.secondary[BRAND],
          disabled: c.surface.disabled[BRAND],
        },
        text: {
          DEFAULT: c.text.primary[BRAND],
          secondary: c.text.secondary[BRAND],
          disabled: c.text.disabled[BRAND],
        },
        status: {
          error: c.feedback.error[BRAND],
          info: c.feedback.info[BRAND],
          success: c.feedback.success[BRAND],
          warning: c.feedback.warning[BRAND],
        },
        border: {
          DEFAULT: c.input.border[BRAND],
        },
        link: {
          DEFAULT: c.button.link.text[BRAND],
        },
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        main: [tokens.fonts.main[BRAND], 'system-ui', 'sans-serif'],
        secondary: [tokens.fonts.secondary[BRAND], 'Georgia', 'serif'],
      },

      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      fontSize: {
        'display-1': typeStyle('headline1'),
        'display-2': typeStyle('headline2'),
        'headline-3': typeStyle('headline3'),
        'headline-4': typeStyle('headline4'),
        'headline-5': typeStyle('headline5'),
        'headline-6': typeStyle('headline6'),
        'headline-7': typeStyle('headline7'),
        'headline-8': typeStyle('headline8'),
        'headline-9': typeStyle('headline9'),
        'paragraph-1': typeStyle('paragraph1'),
        'paragraph-2': typeStyle('paragraph2'),
        'text-1': typeStyle('text1'),
        'text-2': typeStyle('text2'),
        'text-3': typeStyle('text3'),
        'caption-1': typeStyle('caption1'),
        'caption-2': typeStyle('caption2'),
        'disclaimer-1': typeStyle('disclaimer1'),
        button: typeStyle('button1'),
        link: typeStyle('links1'),
      },

      // ─── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        xxxs: `${tokens.spacing.xxxs}px`,
        xxs: `${tokens.spacing.xxs}px`,
        xs: `${tokens.spacing.xs}px`,
        sm: `${tokens.spacing.sm}px`,
        md: `${tokens.spacing.md}px`,
        lg: `${tokens.spacing.lg}px`,
        xl: `${tokens.spacing.xl}px`,
        xxl: `${tokens.spacing.xxl}px`,
        xxxl: `${tokens.spacing.xxxl}px`,
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        sm: `${r.sm[BRAND]}px`,
        md: `${r.md[BRAND]}px`,
        lg: `${r.lg[BRAND]}px`,
        xl: `${r.xl[BRAND]}px`,
        xxl: `${r.xxl[BRAND]}px`,
        button: `${r.button[BRAND]}px`,
        ribbon: `${r.ribbon[BRAND]}px`,
        input: `${r.input[BRAND]}px`,
        none: '0px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        xxl: shadows.xxl,
        none: shadows.none,
      },

      // ─── Breakpoints ─────────────────────────────────────────────────────
      screens: {
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        '2xl': breakpoints['2xl'],
      },

      // ─── Layout ──────────────────────────────────────────────────────────
      maxWidth: {
        'container-narrow': `${layout.containerNarrow}px`,
        'container-wide': `${layout.containerWide}px`,
      },

      minHeight: {
        field: `${layout.fieldMinHeight}px`,
      },

      borderWidth: {
        DEFAULT: `${layout.borderWidth}px`,
      },
    },
  },
  plugins: [],
}

export default config
