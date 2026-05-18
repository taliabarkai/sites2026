'use client'

import { useState, useEffect } from 'react'

// ── Token data — sourced from tokens.json (Figma: Tenengroup — Design System) ──

const THEMES: Record<string, ThemeData> = {
  TGR: {
    label: 'TGR — Theo Grace',
    fontMain: "'Lato', system-ui, sans-serif",
    fontMainName: 'Lato',
    fontSecondary: "'Big Caslon', Georgia, serif",
    fontSecondaryName: 'Big Caslon',
    textTransform: 'capitalize',
    btnLetterSpacing: 0,
    colors: {
      background: '#ffffff', brandPrimary: '#1e1e1e', brandSecondary: '#ffffff',
      textPrimary: '#1e1e1e', textSecondary: '#808080', textDisabled: '#f8f8f8',
      surfacePrimary: '#f8f8f8', surfaceSecondary: '#f4f1ee', surfaceDisabled: '#808080',
      error: '#b6475f', warning: '#f36641', success: '#478978', info: '#e6f0f8',
      border: '#ebebeb', inputBg: '#ffffff', inputBorder: '#ebebeb',
      inputText: '#1e1e1e', inputPlaceholder: '#808080', cardImageBg: '#f6f8fa',
    },
    buttons: [
      { label: 'Primary',     bg: '#1e1e1e',    text: '#ffffff',    border: 'transparent' },
      { label: 'Secondary',   bg: '#ffffff',    text: '#1e1e1e',    border: '#1e1e1e' },
      { label: 'Add to Cart', bg: '#1e1e1e',    text: '#ffffff',    border: 'transparent' },
      { label: 'Preview',     bg: '#e6f0f8',    text: '#1e1e1e',    border: '#e6f0f8' },
      { label: 'Disabled',    bg: '#808080',    text: '#f8f8f8',    border: '#808080' },
      { label: 'Danger',      bg: '#8e0000',    text: '#ffffff',    border: '#8e0000' },
      { label: 'Success',     bg: '#2b8b68',    text: '#ffffff',    border: '#2b8b68' },
      { label: 'Link',        bg: 'transparent',text: '#1e1e1e',    border: 'transparent', link: true },
    ],
    radius: { button: 100, ribbon: 100, input: 4, lg: 12 },
    ribbons: [
      { label: 'Default',   bg: '#bedff7', text: '#1e1e1e' },
      { label: 'Bundle',    bg: '#478978', text: '#ffffff' },
      { label: 'OOS',       bg: '#808080', text: '#ffffff' },
      { label: 'Secondary', bg: '#1e1e1e', text: '#ffffff' },
    ],
    price: { selling: '#1e1e1e', crossed: '#808080', discountText: '#1e1e1e', discountBg: '#f8f8f8' },
  },
  OAL: {
    label: 'OAL — Oak and Luna',
    fontMain: "GillSans, 'Gill Sans MT', 'Century Gothic', sans-serif",
    fontMainName: 'Gill Sans',
    fontSecondary: "'Bebas Neue', sans-serif",
    fontSecondaryName: 'Bebas Neue',
    fontTertiary: "'Akatab', sans-serif",
    fontTertiaryName: 'Akatab',
    ribbonFont: "'Bebas Neue', sans-serif",
    textTransform: 'uppercase',
    boldWeight: 600,
    colors: {
      background: '#ffffff', brandPrimary: '#000000', brandSecondary: '#ffffff',
      textPrimary: '#000000', textSecondary: '#808080', textDisabled: '#9b9b9b',
      surfacePrimary: '#f8f8f8', surfaceSecondary: '#f8f8f8', surfaceDisabled: '#f8f8f8',
      error: '#8e0000', warning: '#cd644c', success: '#2b8b68', info: '#393781',
      border: '#ebebeb', inputBg: '#ffffff', inputBorder: '#ebebeb',
      inputText: '#000000', inputPlaceholder: '#808080', cardImageBg: '#ffffff',
    },
    buttons: [
      { label: 'Primary',     bg: '#000000',    text: '#ffffff',    border: 'transparent' },
      { label: 'Secondary',   bg: 'transparent',text: '#000000',    border: '#000000' },
      { label: 'Add to Cart', bg: '#f8f8f8',    text: '#000000',    border: 'transparent' },
      { label: 'Preview',     bg: '#f8f8f8',    text: '#000000',    border: '#000000' },
      { label: 'Disabled',    bg: '#f5f5f5',    text: '#989898',    border: '#f5f5f5' },
      { label: 'Danger',      bg: '#8e0000',    text: '#ffffff',    border: '#8e0000' },
      { label: 'Success',     bg: '#2b8b68',    text: '#ffffff',    border: '#2b8b68' },
      { label: 'Link',        bg: 'transparent',text: '#000000',    border: 'transparent', link: true },
    ],
    radius: { button: 0, ribbon: 0, input: 4, lg: 16 },
    ribbons: [
      { label: 'Default',   bg: '#ffffff', text: '#000000' },
      { label: 'Bundle',    bg: '#000000', text: '#ffffff' },
      { label: 'OOS',       bg: '#808080', text: '#ffffff' },
      { label: 'Secondary', bg: '#000000', text: '#ffffff' },
    ],
    price: { selling: '#000000', crossed: '#808080', discountText: '#000000', discountBg: '#f8f8f8' },
    typeOverrides: {
      headline4: { family: 'secondary' },
      headline5: { family: 'secondary' },
      headline7: { family: 'main' },
      headline8: { family: 'tertiary' },
    },
  },
  LAL: {
    label: 'LAL — Lime and Lou',
    fontMain: "'Poppins', system-ui, sans-serif",
    fontMainName: 'Poppins',
    fontSecondary: "'EB Garamond', Georgia, serif",
    fontSecondaryName: 'EB Garamond',
    textTransform: 'uppercase',
    colors: {
      background: '#ffffff', brandPrimary: '#e8ff36', brandSecondary: '#000000',
      textPrimary: '#000000', textSecondary: '#989898', textDisabled: '#f5f5f5',
      surfacePrimary: '#f5f5f5', surfaceSecondary: '#ebe2de', surfaceDisabled: '#e3e3e3',
      error: '#8e0000', warning: '#f36641', success: '#2b8b68', info: '#000000',
      border: '#e3e3e3', inputBg: '#ffffff', inputBorder: '#e3e3e3',
      inputText: '#000000', inputPlaceholder: '#989898', cardImageBg: '#ffffff',
    },
    buttons: [
      { label: 'Primary',     bg: '#000000',    text: '#ffffff',    border: 'transparent' },
      { label: 'Secondary',   bg: 'transparent',text: '#000000',    border: '#000000' },
      { label: 'Add to Cart', bg: '#e8ff36',    text: '#000000',    border: 'transparent' },
      { label: 'Preview',     bg: '#ebe2de',    text: '#000000',    border: '#ebe2de' },
      { label: 'Disabled',    bg: '#f5f5f5',    text: '#989898',    border: '#f5f5f5' },
      { label: 'Danger',      bg: '#8e0000',    text: '#ffffff',    border: '#8e0000' },
      { label: 'Success',     bg: '#2b8b68',    text: '#ffffff',    border: '#2b8b68' },
      { label: 'Link',        bg: 'transparent',text: '#000000',    border: 'transparent', link: true },
    ],
    radius: { button: 0, ribbon: 0, input: 8, lg: 16 },
    ribbons: [
      { label: 'Default',   bg: '#000000', text: '#ffffff' },
      { label: 'Bundle',    bg: '#e8ff36', text: '#000000' },
      { label: 'OOS',       bg: '#808080', text: '#ffffff' },
      { label: 'Secondary', bg: '#e8ff36', text: '#000000' },
    ],
    price: { selling: '#8e0000', crossed: '#989898', discountText: '#000000', discountBg: '#f8f8f8' },
  },
  IB: {
    label: 'IB — Israel Blessing',
    fontMain: "'Assistant', system-ui, sans-serif",
    fontMainName: 'Assistant',
    fontSecondary: "'Assistant', system-ui, sans-serif",
    fontSecondaryName: 'Assistant',
    textTransform: 'uppercase',
    colors: {
      background: '#ffffff', brandPrimary: '#122f4f', brandSecondary: '#ffffff',
      textPrimary: '#122f4f', textSecondary: '#bebebe', textDisabled: '#f8f8f8',
      surfacePrimary: '#f3f5f6', surfaceSecondary: '#f9f8f7', surfaceDisabled: '#e0dcd5',
      error: '#bc0000', warning: '#f36641', success: '#2b8b68', info: '#4a5f7f',
      border: '#ebebeb', inputBg: '#f3f5f6', inputBorder: '#ebebeb',
      inputText: '#122f4f', inputPlaceholder: '#bebebe', cardImageBg: '#f9f8f7',
    },
    buttons: [
      { label: 'Primary',     bg: '#8e9279',    text: '#ffffff',    border: '#8e9279' },
      { label: 'Secondary',   bg: '#ffffff',    text: '#122f4f',    border: '#122f4f' },
      { label: 'Add to Cart', bg: '#122f4f',    text: '#ffffff',    border: '#122f4f' },
      { label: 'Preview',     bg: '#f9f8f7',    text: '#122f4f',    border: '#f9f8f7' },
      { label: 'Disabled',    bg: '#f8f8f8',    text: '#bebebe',    border: '#f8f8f8' },
      { label: 'Danger',      bg: '#bc0000',    text: '#ffffff',    border: '#bc0000' },
      { label: 'Success',     bg: '#2b8b68',    text: '#ffffff',    border: '#2b8b68' },
      { label: 'Link',        bg: 'transparent',text: '#122f4f',    border: 'transparent', link: true },
    ],
    radius: { button: 4, ribbon: 0, input: 4, lg: 16 },
    ribbons: [
      { label: 'Default',   bg: '#8e9279', text: '#ffffff' },
      { label: 'Bundle',    bg: '#a3754d', text: '#ffffff' },
      { label: 'OOS',       bg: '#808080', text: '#ffffff' },
      { label: 'Secondary', bg: '#8e9279', text: '#ffffff' },
    ],
    price: { selling: '#122f4f', crossed: '#122f4f', discountText: '#122f4f', discountBg: '#f3f5f6' },
  },
  MNN: {
    label: 'MNN — MYKA',
    fontMain: "'Ano', 'Arial Narrow', sans-serif",
    fontMainName: 'Ano',
    fontSecondary: "'Ano', 'Arial Narrow', sans-serif",
    fontSecondaryName: 'Ano (Mafra)',
    btnFontSize: 14,
    textTransform: 'uppercase',
    colors: {
      background: '#ffffff', brandPrimary: '#000000', brandSecondary: '#ffffff',
      textPrimary: '#000000', textSecondary: '#808080', textDisabled: '#f8f8f8',
      surfacePrimary: '#f7f7f4', surfaceSecondary: '#f4eee9', surfaceDisabled: '#808080',
      error: '#bc0000', warning: '#ef7d60', success: '#2b8b68', info: '#548fcb',
      border: '#ebebeb', inputBg: '#f7f7f4', inputBorder: '#ebebeb',
      inputText: '#000000', inputPlaceholder: '#808080', cardImageBg: '#f7f7f4',
    },
    buttons: [
      { label: 'Primary',     bg: '#000000',    text: '#ffffff',    border: '#000000' },
      { label: 'Secondary',   bg: 'transparent',text: '#000000',    border: '#000000' },
      { label: 'Add to Cart', bg: '#e6c379',    text: '#000000',    border: 'transparent' },
      { label: 'Preview',     bg: '#f7f7f4',    text: '#000000',    border: '#000000' },
      { label: 'Disabled',    bg: '#f8f8f8',    text: '#808080',    border: '#f8f8f8' },
      { label: 'Danger',      bg: '#8e0000',    text: '#ffffff',    border: '#8e0000' },
      { label: 'Success',     bg: '#2b8b68',    text: '#ffffff',    border: '#2b8b68' },
      { label: 'Link',        bg: 'transparent',text: '#000000',    border: 'transparent', link: true },
    ],
    radius: { button: 4, ribbon: 100, input: 4, lg: 12 },
    ribbons: [
      { label: 'Default',   bg: '#ffffff', text: '#000000' },
      { label: 'Bundle',    bg: '#09391e', text: '#ffffff' },
      { label: 'OOS',       bg: '#808080', text: '#ffffff' },
      { label: 'Secondary', bg: '#000000', text: '#ffffff' },
    ],
    price: { selling: '#bc0000', crossed: '#808080', discountText: '#000000', discountBg: '#f7f7f4' },
  },
}

const TYPE_SCALE = {
  headlines: [
    { token: 'headline1', fs: 40, lh: 48, fw: 400, family: 'secondary', mob: '30px mob' },
    { token: 'headline2', fs: 28, lh: 36, fw: 400, family: 'secondary', mob: '20px mob' },
    { token: 'headline3', fs: 28, lh: 36, fw: 400, family: 'secondary', mob: '20px mob' },
    { token: 'headline4', fs: 24, lh: 28, fw: 400, family: 'main' },
    { token: 'headline5', fs: 20, lh: 24, fw: 300, family: 'main' },
    { token: 'headline6', fs: 16, lh: 20, fw: 400, family: 'secondary' },
    { token: 'headline7', fs: 14, lh: 20, fw: 400, family: 'tertiary' },
    { token: 'headline8', fs: 16, lh: 20, fw: 400, family: 'main', transform: 'uppercase' },
    { token: 'headline9', fs: 24, lh: 28, fw: 400, family: 'secondary', mob: '16px mob' },
  ],
  paragraphs: [
    { token: 'paragraph1', fs: 18, lh: 22, fw: 400, family: 'main' },
    { token: 'paragraph2', fs: 18, lh: 22, fw: 700, family: 'main' },
    { token: 'paragraph3', fs: 16, lh: 22, fw: 700, family: 'main' },
    { token: 'paragraph4', fs: 16, lh: 22, fw: 400, family: 'main' },
  ],
  body: [
    { token: 'text1', fs: 14, lh: 20, fw: 400, family: 'main' },
    { token: 'text2', fs: 14, lh: 20, fw: 700, family: 'main' },
    { token: 'text3', fs: 12, lh: 16, fw: 400, family: 'main' },
    { token: 'text4', fs: 12, lh: 16, fw: 700, family: 'main' },
    { token: 'text7', fs: 14, lh: 20, fw: 300, family: 'main' },
    { token: 'text8', fs: 10, lh: 14, fw: 400, family: 'main' },
    { token: 'text9', fs: 10, lh: 14, fw: 700, family: 'main' },
  ],
  ui: [
    { token: 'caption1',    fs: 12, lh: 16, fw: 400, family: 'main' },
    { token: 'caption2',    fs: 12, lh: 16, fw: 700, family: 'main' },
    { token: 'disclaimer1', fs: 10, lh: 14, fw: 400, family: 'main' },
    { token: 'disclaimer2', fs: 10, lh: 14, fw: 700, family: 'main' },
    { token: 'button',      fs: 16, lh: 24, fw: 700, family: 'tertiary' },
    { token: 'button2',     fs: 14, lh: 20, fw: 400, family: 'main' },
    { token: 'link',        fs: 14, lh: 20, fw: 500, family: 'main', decoration: 'underline' },
    { token: 'ribbon',      fs: 14, lh: 20, fw: 400, family: 'secondary', mob: '12px mob' },
  ],
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThemeColors {
  background: string; brandPrimary: string; brandSecondary: string
  textPrimary: string; textSecondary: string; textDisabled: string
  surfacePrimary: string; surfaceSecondary: string; surfaceDisabled: string
  error: string; warning: string; success: string; info: string
  border: string; inputBg: string; inputBorder: string
  inputText: string; inputPlaceholder: string; cardImageBg: string
}

interface ThemeButton { label: string; bg: string; text: string; border: string; link?: boolean }
interface ThemeRibbon { label: string; bg: string; text: string }
interface ThemeRadius { button: number; ribbon: number; input: number; lg: number }
interface ThemePrice  { selling: string; crossed: string; discountText: string; discountBg: string }

interface ThemeData {
  label: string
  fontMain: string; fontMainName: string
  fontSecondary: string; fontSecondaryName: string
  fontTertiary?: string; fontTertiaryName?: string
  ribbonFont?: string
  textTransform: string
  boldWeight?: number
  btnLetterSpacing?: number
  btnFontSize?: number
  colors: ThemeColors
  buttons: ThemeButton[]
  radius: ThemeRadius
  ribbons: ThemeRibbon[]
  price: ThemePrice
  typeOverrides?: Record<string, { family?: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveFont(family: string, theme: ThemeData): string {
  if (family === 'secondary') return theme.fontSecondary
  if (family === 'tertiary')  return theme.fontTertiary ?? theme.fontMain
  return theme.fontMain
}

function resolveFontName(family: string, theme: ThemeData): string {
  if (family === 'secondary') return theme.fontSecondaryName
  if (family === 'tertiary')  return theme.fontTertiaryName ?? theme.fontMainName
  return theme.fontMainName
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SwatchCard({ name, hex }: { name: string; hex: string }) {
  const display = hex === 'transparent' ? 'rgba(0,0,0,0)' : hex
  return (
    <div style={{ width: 'max-content', minWidth: 64 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid #ebebeb', background: display, marginBottom: 6 }} />
      <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.4 }}>{name}</div>
      <div style={{ fontSize: 10, color: '#808080', fontFamily: 'monospace' }}>{hex}</div>
    </div>
  )
}

function TypeRow({ entry, theme }: { entry: typeof TYPE_SCALE.headlines[0] & { transform?: string; decoration?: string; mob?: string }; theme: ThemeData }) {
  const override = theme.typeOverrides?.[entry.token]
  const family = override?.family ?? entry.family
  const ff = resolveFont(family, theme)
  const ffName = resolveFontName(family, theme)
  const fw = entry.fw === 700 && entry.family !== 'secondary' ? (theme.boldWeight ?? 700) : entry.fw
  const details = `${entry.fs}px / ${entry.lh}px · w${fw} · ${ffName}${entry.mob ? ' · ' + entry.mob : ''}`
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center', gap: 20, padding: '10px 0', borderBottom: '1px solid #ebebeb' }}>
      <div>
        <code style={{ fontSize: 10, background: '#f8f8f8', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', display: 'inline-block', marginBottom: 4 }}>
          {entry.token}
        </code>
        <div style={{ fontSize: 10, color: '#808080', fontFamily: 'monospace' }}>{details}</div>
      </div>
      <div style={{
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        fontFamily: ff,
        fontSize: Math.min(entry.fs, 34),
        lineHeight: `${entry.lh}px`,
        fontWeight: fw,
        textTransform: (entry.transform as any) ?? 'none',
        textDecoration: entry.decoration ?? 'none',
      }}>
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  )
}

// ── Theme input (default border → text/primary on hover) ─────────────────────

function ThemeTextInput({
  colors: c,
  radius,
  fontFamily,
  placeholder,
  value,
}: {
  colors: ThemeColors
  radius: number
  fontFamily: string
  placeholder?: string
  value?: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: c.inputBg,
        border: `1px solid ${hovered ? c.textPrimary : c.border}`,
        borderRadius: radius,
        color: c.inputText,
        fontFamily,
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 150ms ease',
      }}
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const THEME_KEYS = ['TGR', 'OAL', 'LAL', 'IB', 'MNN']
const NAV_SECTIONS = [
  { id: 'colors',     label: 'Colors' },
  { id: 'buttons',    label: 'Buttons' },
  { id: 'ribbons',    label: 'Ribbons & Price' },
  { id: 'inputs',     label: 'Inputs' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing',    label: 'Spacing' },
  { id: 'radius',     label: 'Radius' },
  { id: 'shadows',    label: 'Shadows' },
  { id: 'breakpoints',label: 'Breakpoints' },
]

export default function StyleGuidePage() {
  const [activeTheme, setActiveTheme] = useState('TGR')
  const [activeSection, setActiveSection] = useState('colors')

  const theme = THEMES[activeTheme]
  const c = theme.colors
  const r = theme.radius

  // Sticky nav highlight via IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[data-section]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection((e.target as HTMLElement).dataset.section ?? '')
        })
      },
      { threshold: 0.25 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const btnType = TYPE_SCALE.ui.find((e) => e.token === 'button')!
  const ribbonType = TYPE_SCALE.ui.find((e) => e.token === 'ribbon')!
  const btnFs = theme.btnFontSize ?? btnType.fs
  const btnFw = theme.boldWeight ?? btnType.fw

  const colorGroups = [
    { group: 'Brand',    tokens: [['brand/primary', c.brandPrimary], ['brand/secondary', c.brandSecondary], ['background', c.background]] },
    { group: 'Text',     tokens: [['text/primary', c.textPrimary], ['text/secondary', c.textSecondary], ['text/disabled', c.textDisabled]] },
    { group: 'Surface',  tokens: [['surface/primary', c.surfacePrimary], ['surface/secondary', c.surfaceSecondary], ['surface/disabled', c.surfaceDisabled]] },
    { group: 'Feedback', tokens: [['error', c.error], ['warning', c.warning], ['success', c.success], ['info', c.info]] },
    { group: 'UI',       tokens: [['border', c.border], ['card/image-bg', c.cardImageBg]] },
  ]

  const showSecondary = theme.fontSecondaryName !== theme.fontMainName
  const showTertiary  = theme.fontTertiaryName && theme.fontTertiaryName !== theme.fontMainName && theme.fontTertiaryName !== theme.fontSecondaryName

  return (
    <div style={{ fontFamily: theme.fontMain, color: c.textPrimary, background: '#ffffff', minHeight: '100vh', margin: 0 }}>

      {/* ── Header ── */}
      <header style={{ background: '#ffffff', color: '#111', padding: '28px 64px 24px', borderBottom: '1px solid #ebebeb' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.45, marginBottom: 5 }}>
          Tenengroup Design System · 5 Brand Themes · Source: Figma → Tenengroup — Design System → tokens.json
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>Style Guide</h1>
        <p style={{ fontSize: 12, opacity: 0.4, fontFamily: 'monospace', marginTop: 5 }}>
          tokens.json extracted 2026-05-18 · 4 Figma variable collections · Color · Radius · Spacing · Fonts
        </p>
      </header>

      {/* ── Theme switcher ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #ebebeb', padding: '10px 64px', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, zIndex: 101 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginRight: 4 }}>Theme</span>
        {THEME_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTheme(key)}
            style={{
              padding: '5px 14px', borderRadius: 100, border: '1px solid',
              borderColor: activeTheme === key ? '#111' : 'rgba(0,0,0,0.2)',
              background: activeTheme === key ? '#111' : 'transparent',
              color: activeTheme === key ? '#fff' : 'rgba(0,0,0,0.45)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* ── Sticky nav ── */}
      <nav style={{
        background: '#f8f8f8', borderBottom: '1px solid #ebebeb', padding: '0 64px',
        display: 'flex', gap: 0, position: 'sticky', top: 46, zIndex: 100,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {NAV_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            style={{
              display: 'block', whiteSpace: 'nowrap', padding: '13px 16px',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none',
              color: activeSection === id ? c.textPrimary : '#808080',
              borderBottom: activeSection === id ? `2px solid ${c.brandPrimary}` : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              fontFamily: theme.fontMain,
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px 80px' }}>

        {/* ── 01 Colors ── */}
        <section data-section="colors" id="colors" style={{ paddingTop: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            01 — Colors
          </p>
          {colorGroups.map(({ group, tokens }) => (
            <div key={group}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#808080', margin: '20px 0 10px' }}>{group}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
                {(tokens as [string, string][]).map(([name, hex]) => (
                  <SwatchCard key={name} name={name} hex={hex} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── 02 Buttons ── */}
        <section data-section="buttons" id="buttons" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            02 — Button Variants
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {theme.buttons.filter(btn => btn.label !== 'Danger' && btn.label !== 'Success').map((btn) => {
              const br   = btn.link ? 0 : r.button
              const fs   = btnFs
              const lh   = btnType.lh
              return (
                <div key={btn.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{btn.label}</div>
                  <div style={{
                    padding: btn.link ? '8px 4px' : '10px 22px',
                    border: btn.link ? 'none' : '1px solid',
                    borderColor: btn.border,
                    borderRadius: br,
                    background: btn.bg,
                    color: btn.text,
                    fontWeight: btn.link ? 'inherit' : btnFw,
                    fontSize: fs,
                    lineHeight: `${lh}px`,
                    fontFamily: theme.fontMain,
                    textTransform: theme.textTransform as any,
                    letterSpacing: theme.btnLetterSpacing !== undefined ? theme.btnLetterSpacing : '0.04em',
                    textDecoration: btn.link ? 'underline' : 'none',
                    cursor: 'default',
                    textAlign: 'center',
                  }}>
                    {btn.label}
                  </div>
                  <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>
                    {fs}px / lh{lh} · w{btnFw} · bg {btn.bg}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 03 Ribbons & Price ── */}
        <section data-section="ribbons" id="ribbons" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            03 — Ribbons &amp; Price
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#808080', margin: '0 0 10px' }}>Ribbons</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {theme.ribbons.map((rb) => (
              <div key={rb.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#808080', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{rb.label}</div>
                <div style={{
                  padding: '4px 12px',
                  background: rb.bg,
                  color: rb.text,
                  borderRadius: r.ribbon,
                  fontFamily: theme.ribbonFont ?? theme.fontMain,
                  fontSize: ribbonType.fs,
                  lineHeight: `${ribbonType.lh}px`,
                  fontWeight: ribbonType.fw,
                  textTransform: theme.textTransform as any,
                  display: 'inline-block',
                  width: 'fit-content',
                }}>
                  {rb.label}
                </div>
                <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>
                  bg {rb.bg} · text {rb.text} · r:{r.ribbon}px
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: '#808080', margin: '28px 0 10px' }}>Price</p>
          {[
            { selling: theme.price.selling, crossed: theme.price.crossed, discount: true },
            { selling: theme.price.selling, crossed: null, discount: false },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 0', borderBottom: '1px solid #ebebeb' }}>
              <span style={{ fontSize: 18, fontWeight: theme.boldWeight ?? 700, color: row.selling }}>$99.00</span>
              {row.crossed && <span style={{ fontSize: 16, textDecoration: 'line-through', color: row.crossed }}>$149.00</span>}
              {row.discount && (
                <span style={{ fontSize: 11, fontWeight: theme.boldWeight ?? 700, padding: '2px 8px', borderRadius: 4, color: theme.price.discountText, background: theme.price.discountBg }}>–33%</span>
              )}
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#808080', marginLeft: 8 }}>
                {row.discount ? 'price/selling · price/crossed · price/discount' : 'price/selling (no discount)'}
              </span>
            </div>
          ))}
        </section>

        {/* ── 04 Inputs ── */}
        <section data-section="inputs" id="inputs" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            04 — Form Inputs
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, maxWidth: 800 }}>
            {[
              { label: 'Text Input', placeholder: 'Placeholder text', value: undefined },
              { label: 'With Value', placeholder: undefined, value: 'user@example.com' },
            ].map(({ label, placeholder, value }) => (
              <div key={label} style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <ThemeTextInput
                  colors={c}
                  radius={r.input}
                  fontFamily={theme.fontMain}
                  placeholder={placeholder}
                  value={value}
                />
                <div style={{ fontSize: 9, color: c.textSecondary, fontFamily: 'monospace', marginTop: 4 }}>
                  bg {c.inputBg} · border {c.border} → hover {c.textPrimary} · r:{r.input}px
                </div>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Checkbox</div>
              {[['Checked state', true], ['Unchecked state', false]].map(([label, checked], i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: theme.fontMain, fontSize: 14, color: c.textPrimary, marginTop: i > 0 ? 8 : 0 }}>
                  <input type="checkbox" defaultChecked={checked as boolean} style={{ accentColor: c.brandPrimary, width: 16, height: 16, cursor: 'pointer' }} />
                  {label as string}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── 05 Typography ── */}
        <section data-section="typography" id="typography" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            05 — Typography
          </p>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 28 }}>
            {[
              { label: `Main — ${theme.fontMainName}`, family: theme.fontMain },
              ...(showSecondary ? [{ label: `Secondary — ${theme.fontSecondaryName}`, family: theme.fontSecondary }] : []),
              ...(showTertiary  ? [{ label: `Tertiary — ${theme.fontTertiaryName}`,   family: theme.fontTertiary! }] : []),
            ].map((f) => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: c.textSecondary, marginBottom: 6 }}>{f.label}</div>
                <div style={{ fontFamily: f.family, fontSize: 22, fontWeight: 400 }}>The quick brown fox</div>
                <div style={{ fontFamily: f.family, fontSize: 22, fontWeight: theme.boldWeight ?? 700, marginTop: 2 }}>The quick brown fox</div>
              </div>
            ))}
          </div>

          {[
            { label: 'Headlines',                  entries: TYPE_SCALE.headlines },
            { label: 'Paragraphs',                 entries: TYPE_SCALE.paragraphs },
            { label: 'Body Text',                  entries: TYPE_SCALE.body },
            { label: 'Captions, Disclaimers & UI', entries: TYPE_SCALE.ui },
          ].map(({ label, entries }) => (
            <div key={label}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#808080', margin: '20px 0 10px' }}>{label}</p>
              {(entries as any[]).map((entry) => (
                <TypeRow key={entry.token} entry={entry} theme={theme} />
              ))}
            </div>
          ))}
        </section>

        {/* ── 06 Spacing ── */}
        <section data-section="spacing" id="spacing" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            06 — Spacing
          </p>
          <div style={{ maxWidth: 500 }}>
            {[
              { token: 'xxxs', px: 4,  bar: 12  },
              { token: 'xxs',  px: 8,  bar: 24  },
              { token: 'xs',   px: 12, bar: 36  },
              { token: 'sm',   px: 16, bar: 48  },
              { token: 'md',   px: 24, bar: 72  },
              { token: 'lg',   px: 32, bar: 96  },
              { token: 'xl',   px: 40, bar: 120 },
              { token: 'xxl',  px: 60, bar: 180 },
              { token: 'xxxl', px: 72, bar: 216 },
            ].map(({ token, px, bar }) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #ebebeb' }}>
                <span style={{ width: 64, fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{token}</span>
                <span style={{ width: 52, fontSize: 12, color: '#808080', fontFamily: 'monospace' }}>{px}px</span>
                <div style={{ height: 20, width: bar, background: c.brandPrimary, borderRadius: 3 }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── 07 Radius ── */}
        <section data-section="radius" id="radius" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            07 — Border Radius
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#808080', margin: '0 0 12px' }}>Base Scale</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            {[
              { token: 'none', val: 0 }, { token: 'sm', val: 4 }, { token: 'md', val: 8 },
              { token: 'lg',   val: r.lg }, { token: 'xl', val: 20 }, { token: 'xxl', val: 50, display: '100px' },
            ].map(({ token, val, display }) => (
              <div key={token} style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#f4f1ee', border: '2px solid #ebebeb', borderRadius: val, margin: '0 auto 8px' }} />
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: c.brandPrimary, display: 'block' }}>{token}</span>
                <span style={{ fontSize: 10, color: '#808080', fontFamily: 'monospace' }}>{display ?? `${val}px`}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#808080', margin: '32px 0 12px' }}>
            Component Radius — Per Brand
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            {[
              { token: 'button', val: r.button },
              { token: 'ribbon', val: r.ribbon },
              { token: 'input',  val: r.input },
            ].map(({ token, val }) => (
              <div key={token} style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: '#f4f1ee', border: '2px solid #ebebeb', borderRadius: Math.min(val, 40), margin: '0 auto 8px' }} />
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: c.brandPrimary, display: 'block' }}>{token}</span>
                <span style={{ fontSize: 10, color: '#808080', fontFamily: 'monospace' }}>{val}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 08 Shadows ── */}
        <section data-section="shadows" id="shadows" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            08 — Shadows
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: '24px 0' }}>
            {[
              { token: 'sm',  shadow: '0 1px 3px 0 rgba(0,0,0,0.08),0 1px 2px -1px rgba(0,0,0,0.06)' },
              { token: 'md',  shadow: '0 4px 6px -1px rgba(0,0,0,0.08),0 2px 4px -2px rgba(0,0,0,0.06)' },
              { token: 'lg',  shadow: '0 10px 15px -3px rgba(0,0,0,0.08),0 4px 6px -4px rgba(0,0,0,0.05)' },
              { token: 'xl',  shadow: '0 20px 25px -5px rgba(0,0,0,0.08),0 8px 10px -6px rgba(0,0,0,0.05)' },
              { token: 'xxl', shadow: '0 25px 50px -12px rgba(0,0,0,0.18)' },
            ].map(({ token, shadow }) => (
              <div key={token} style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 60, background: '#fff', borderRadius: 8, margin: '0 auto 12px', boxShadow: shadow }} />
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: c.textPrimary }}>{token}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 09 Breakpoints ── */}
        <section data-section="breakpoints" id="breakpoints" style={{ paddingTop: 52, borderTop: '1px solid #ebebeb', marginTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
            09 — Breakpoints
          </p>
          <div style={{ maxWidth: 680 }}>
            {[
              { token: 'sm',  val: '640px',  pct: '44.4%' },
              { token: 'md',  val: '768px',  pct: '53.3%' },
              { token: 'lg',  val: '1024px', pct: '71.1%' },
              { token: 'xl',  val: '1280px', pct: '88.9%' },
              { token: '2xl', val: '1440px', pct: '100%'  },
            ].map(({ token, val, pct }) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #ebebeb' }}>
                <span style={{ width: 48, fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{token}</span>
                <span style={{ width: 56, fontSize: 12, color: '#808080', fontFamily: 'monospace' }}>{val}</span>
                <div style={{ flex: 1, height: 8, background: c.surfacePrimary, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct, background: c.brandPrimary, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
