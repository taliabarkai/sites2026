/**
 * Design Tokens — Typed TypeScript exports
 *
 * Source of truth: /tokens.json (extracted from Figma AI-DESIGN-SYSTEM)
 * Theme: TGR (default)
 *
 * Usage:
 *   import { colors, typography, spacing, radii, shadows, breakpoints } from '@/styles/design-tokens'
 *
 *   <div style={{ color: colors.semantic.text, padding: spacing.md }} />
 */

import rawTokens from '../tokens.json'

// ─── Re-export raw tokens for direct access ───────────────────────────────────
export const tokens = rawTokens

// ─── Colors ──────────────────────────────────────────────────────────────────

export type HexColor = `#${string}`

export interface PrimitiveTgrColors {
  raisinBlack: HexColor
  babyBlue: HexColor
  airBlue: HexColor
  aliceBlue: HexColor
  lightBlue: HexColor
  neutral: HexColor
  red: HexColor
  orange: HexColor
  lightGrey: HexColor
  grey: HexColor
  darkGrey: HexColor
}

export interface PrimitiveOalColors {
  orange: HexColor
  veryLightGrey: HexColor
  lightGrey: HexColor
  grey: HexColor
  darkGrey: HexColor
}

export interface PrimitiveLalColors {
  lime: HexColor
  warmWhite: HexColor
  lightGrey: HexColor
  grey: HexColor
  warmGrey: HexColor
  darkGrey: HexColor
}

export interface PrimitiveIbColors {
  navyBlue: HexColor
  olive: HexColor
  camel: HexColor
  stone: HexColor
  lightBlue: HexColor
  lightStone: HexColor
  grey: HexColor
  lightGrey: HexColor
  darkGrey: HexColor
}

export interface PrimitiveMnnColors {
  duneYellow: HexColor
  blue: HexColor
  lightOliveGreen: HexColor
  oysterCream: HexColor
  grey: HexColor
  lightGrey: HexColor
  darkGrey: HexColor
  coral: HexColor
  oliveGreen: HexColor
  morningSky: HexColor
}

export interface PrimitiveColors {
  black: HexColor
  white: HexColor
  green: HexColor
  red: HexColor
  orange: HexColor
  blue: HexColor
  tgr: PrimitiveTgrColors
  oal: PrimitiveOalColors
  lal: PrimitiveLalColors
  ib: PrimitiveIbColors
  mnn: PrimitiveMnnColors
}

export interface SemanticColors {
  brandPrimary: HexColor
  brandSecondary: HexColor
  colorPrimary: HexColor
  colorSecondary: HexColor
  surfacePrimary: HexColor
  surfaceSecondary: HexColor
  surfaceDisabled: HexColor
  text: HexColor
  textSecondary: HexColor
  textDisabled: HexColor
  error: HexColor
  info: HexColor
  success: HexColor
  warning: HexColor
  border: HexColor
  borderHover: HexColor
  link: HexColor
  linkHover: HexColor
  announcementsBarBackground: HexColor
  announcementsBarText: HexColor
  footerMainBackground: HexColor
  footerMainText: HexColor
  footerNewsletterBackground: HexColor
  footerNewsletterText: HexColor
  formfieldBackground: HexColor
  formfieldBorderColor: HexColor
  formInputPlaceholder: HexColor
  panelHeaderBackground: HexColor
  panelHeaderText: HexColor
  star: HexColor
  starInactive: HexColor
}

export interface ButtonVariantTokens {
  background: HexColor
  text: HexColor
  borderColor: HexColor
  borderRadius?: number
  minHeight?: number
  fontSize?: number
  lineHeight?: number
  letterSpacing?: number
  fontWeight?: number
  textTransform?: string
}

export interface ButtonColors {
  primary: ButtonVariantTokens
  secondary: ButtonVariantTokens
  a2c: ButtonVariantTokens
  preview: ButtonVariantTokens
  disabled: ButtonVariantTokens
  link: ButtonVariantTokens
}

export interface Colors {
  primitives: PrimitiveColors
  semantic: SemanticColors
  buttons: ButtonColors
}

export const colors = rawTokens.colors as unknown as Colors

// ─── Typography ──────────────────────────────────────────────────────────────

export interface FontFamilies {
  main: string
  secondary: string
}

export interface FontWeights {
  light: number
  regular: number
  medium: number
  semiBold: number
  bold: number
}

export interface TypeScaleEntry {
  fontSize:      Record<string, number>
  lineHeight:    Record<string, number>
  fontWeight:    Record<string, number>
  letterSpacing: Record<string, number | null>
  textTransform: Record<string, string>
}

export interface TypeScale {
  headline1: TypeScaleEntry
  headline2: TypeScaleEntry
  headline3: TypeScaleEntry
  headline4: TypeScaleEntry
  headline5: TypeScaleEntry
  headline6: TypeScaleEntry
  headline7: TypeScaleEntry
  headline8: TypeScaleEntry
  headline9: TypeScaleEntry
  headline10: TypeScaleEntry
  headline11: TypeScaleEntry
  headline12: TypeScaleEntry
  text1: TypeScaleEntry
  text2: TypeScaleEntry
  text3: TypeScaleEntry
  text4: TypeScaleEntry
  text5: TypeScaleEntry
  text6: TypeScaleEntry
  text7: TypeScaleEntry
  text8: TypeScaleEntry
  text9: TypeScaleEntry
  caption1: TypeScaleEntry
  caption2: TypeScaleEntry
  disclaimer1: TypeScaleEntry
  disclaimer2: TypeScaleEntry
  paragraph1: TypeScaleEntry
  paragraph2: TypeScaleEntry
  paragraph3: TypeScaleEntry
  paragraph4: TypeScaleEntry
  button: TypeScaleEntry
  button2: TypeScaleEntry
  link: TypeScaleEntry
  ribbon: TypeScaleEntry
}

export interface Typography {
  fontFamilies: FontFamilies
  fontWeights: FontWeights
  scale: TypeScale
}

export const typography = rawTokens.typography as unknown as Typography

export const fonts = rawTokens.fonts

/** Resolve a fontFamily key to the actual CSS font-family string (default brand: TGR) */
export function resolveFontFamily(key: 'main' | 'secondary', brand: BrandKey = 'TGR'): string {
  return fonts[key][brand]
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

export interface Spacing {
  xxxs: number
  xxs: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
  xxxl: number
}

export const spacing = rawTokens.spacing as Spacing

/** Returns spacing value as a px CSS string, e.g. "16px" */
export function px(value: number): string {
  return `${value}px`
}

// ─── Border Radius ────────────────────────────────────────────────────────────

export type BrandKey = 'OAL' | 'MNN' | 'TGR' | 'LAL' | 'IB'

export interface BrandTokenValue {
  OAL: number
  MNN: number
  TGR: number
  LAL: number
  IB: number
}

export interface BorderRadius {
  sm: BrandTokenValue
  md: BrandTokenValue
  lg: BrandTokenValue
  xl: BrandTokenValue
  xxl: BrandTokenValue
  button: BrandTokenValue
  ribbon: BrandTokenValue
  input: BrandTokenValue
}

export const radii = rawTokens.radius as BorderRadius

// ─── Shadows ─────────────────────────────────────────────────────────────────

export interface Shadows {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.10)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
  xl: '0 16px 40px rgba(0,0,0,0.14)',
  xxl: '0 24px 64px rgba(0,0,0,0.16)',
} as Shadows

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export interface Breakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as Breakpoints

/** Returns the numeric value of a breakpoint, e.g. breakpointValue('lg') → 1024 */
export function breakpointValue(key: keyof Breakpoints): number {
  return parseInt(breakpoints[key], 10)
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export interface Layout {
  containerNarrow: number
  containerWide: number
  headerHeight: number
  pageMargin: number
  fieldMinHeight: number
  borderWidth: number
}

export const layout = {
  containerNarrow: 768,
  containerWide: 1200,
  headerHeight: 64,
  pageMargin: 32,
  fieldMinHeight: 44,
  borderWidth: 1,
} as Layout

// ─── Convenience re-exports ───────────────────────────────────────────────────

/** Flat map of all semantic color names → hex values (useful for dynamic lookups) */
export const semanticColorMap: Record<string, HexColor> = colors.semantic as unknown as Record<string, HexColor>

/** All token groups in a single default export */
const designTokens = {
  colors,
  typography,
  fonts,
  spacing,
  radii,
  shadows,
  breakpoints,
  layout,
}

export default designTokens
