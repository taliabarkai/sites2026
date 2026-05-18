import type { Config } from 'tailwindcss'
import tokens from './tokens.json'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors ──────────────────────────────────────────────────────────
      colors: {
        // Semantic (default theme: TGR)
        brand: {
          primary: tokens.colors.semantic.brandPrimary,
          secondary: tokens.colors.semantic.brandSecondary,
        },
        color: {
          primary: tokens.colors.semantic.colorPrimary,
          secondary: tokens.colors.semantic.colorSecondary,
        },
        surface: {
          primary: tokens.colors.semantic.surfacePrimary,
          secondary: tokens.colors.semantic.surfaceSecondary,
          disabled: tokens.colors.semantic.surfaceDisabled,
        },
        text: {
          DEFAULT: tokens.colors.semantic.text,
          secondary: tokens.colors.semantic.textSecondary,
          disabled: tokens.colors.semantic.textDisabled,
        },
        status: {
          error: tokens.colors.semantic.error,
          info: tokens.colors.semantic.info,
          success: tokens.colors.semantic.success,
          warning: tokens.colors.semantic.warning,
        },
        border: {
          DEFAULT: tokens.colors.semantic.border,
          hover: tokens.colors.semantic.borderHover,
        },
        link: {
          DEFAULT: tokens.colors.semantic.link,
          hover: tokens.colors.semantic.linkHover,
        },

        // Primitive palettes (for cross-brand use)
        primitive: {
          black: tokens.colors.primitives.black,
          white: tokens.colors.primitives.white,
          green: tokens.colors.primitives.green,
          red: tokens.colors.primitives.red,
          orange: tokens.colors.primitives.orange,
          blue: tokens.colors.primitives.blue,
        },
        tgr: tokens.colors.primitives.tgr,
        oal: tokens.colors.primitives.oal,
        lal: tokens.colors.primitives.lal,
        ib: tokens.colors.primitives.ib,
        mnn: tokens.colors.primitives.mnn,
      },

      // ─── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        main: [
          'Lato',
          'system-ui',
          'sans-serif',
        ],
        secondary: [
          'BigCaslonRegular',
          'Georgia',
          'serif',
        ],
      },

      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      fontSize: {
        // Named scale matching Figma tokens
        'display-1': [`${tokens.typography.scale.headline1.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline1.lineHeight}px` }],
        'display-2': [`${tokens.typography.scale.headline2.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline2.lineHeight}px` }],
        'headline-3': [`${tokens.typography.scale.headline3.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline3.lineHeight}px` }],
        'headline-4': [`${tokens.typography.scale.headline4.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline4.lineHeight}px` }],
        'headline-5': [`${tokens.typography.scale.headline5.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline5.lineHeight}px` }],
        'headline-6': [`${tokens.typography.scale.headline6.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline6.lineHeight}px` }],
        'headline-7': [`${tokens.typography.scale.headline7.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline7.lineHeight}px` }],
        'headline-8': [`${tokens.typography.scale.headline8.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline8.lineHeight}px` }],
        'headline-9': [`${tokens.typography.scale.headline9.fontSize}px`, { lineHeight: `${tokens.typography.scale.headline9.lineHeight}px` }],
        'paragraph-1': [`${tokens.typography.scale.paragraph1.fontSize}px`, { lineHeight: `${tokens.typography.scale.paragraph1.lineHeight}px` }],
        'paragraph-2': [`${tokens.typography.scale.paragraph2.fontSize}px`, { lineHeight: `${tokens.typography.scale.paragraph2.lineHeight}px` }],
        'text-1': [`${tokens.typography.scale.text1.fontSize}px`, { lineHeight: `${tokens.typography.scale.text1.lineHeight}px` }],
        'text-2': [`${tokens.typography.scale.text2.fontSize}px`, { lineHeight: `${tokens.typography.scale.text2.lineHeight}px` }],
        'text-3': [`${tokens.typography.scale.text3.fontSize}px`, { lineHeight: `${tokens.typography.scale.text3.lineHeight}px` }],
        'caption-1': [`${tokens.typography.scale.caption1.fontSize}px`, { lineHeight: `${tokens.typography.scale.caption1.lineHeight}px` }],
        'caption-2': [`${tokens.typography.scale.caption2.fontSize}px`, { lineHeight: `${tokens.typography.scale.caption2.lineHeight}px` }],
        'disclaimer-1': [`${tokens.typography.scale.disclaimer1.fontSize}px`, { lineHeight: `${tokens.typography.scale.disclaimer1.lineHeight}px` }],
        'button': [`${tokens.typography.scale.button.fontSize}px`, { lineHeight: `${tokens.typography.scale.button.lineHeight}px` }],
        'link': [`${tokens.typography.scale.link.fontSize}px`, { lineHeight: `${tokens.typography.scale.link.lineHeight}px` }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        'xxxs': `${tokens.spacing.xxxs}px`,
        'xxs': `${tokens.spacing.xxs}px`,
        'xs': `${tokens.spacing.xs}px`,
        'sm': `${tokens.spacing.sm}px`,
        'md': `${tokens.spacing.md}px`,
        'lg': `${tokens.spacing.lg}px`,
        'xl': `${tokens.spacing.xl}px`,
        'xxl': `${tokens.spacing.xxl}px`,
        'xxxl': `${tokens.spacing.xxxl}px`,
      },

      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        'sm': `${tokens.borderRadius.sm}px`,
        'md': `${tokens.borderRadius.md}px`,
        'lg': `${tokens.borderRadius.lg}px`,
        'xl': `${tokens.borderRadius.xl}px`,
        'xxl': `${tokens.borderRadius.xxl}px`,
        'full': `${tokens.borderRadius.full}px`,
        'none': '0px',
      },

      // ─── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        sm: tokens.shadows.sm,
        md: tokens.shadows.md,
        lg: tokens.shadows.lg,
        xl: tokens.shadows.xl,
        xxl: tokens.shadows.xxl,
        none: tokens.shadows.none,
      },

      // ─── Breakpoints ─────────────────────────────────────────────────────
      screens: {
        sm: tokens.breakpoints.sm,
        md: tokens.breakpoints.md,
        lg: tokens.breakpoints.lg,
        xl: tokens.breakpoints.xl,
        '2xl': tokens.breakpoints['2xl'],
      },

      // ─── Layout ──────────────────────────────────────────────────────────
      maxWidth: {
        'container-narrow': `${tokens.layout.containerNarrow}px`,
        'container-wide': `${tokens.layout.containerWide}px`,
      },

      minHeight: {
        'field': `${tokens.layout.fieldMinHeight}px`,
      },

      borderWidth: {
        DEFAULT: `${tokens.layout.borderWidth}px`,
      },
    },
  },
  plugins: [],
}

export default config
