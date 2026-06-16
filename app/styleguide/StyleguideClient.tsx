'use client'

import { useRef, useEffect, useState, type FC } from 'react'
import { useRouter } from 'next/navigation'
import { brandToThemeKey, themeKeyToBrand, type BrandKey } from '../[brand]/_config/brands'
import { Button, type ButtonVariant } from '../[brand]/_components/Button'

import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

type IconComponent = FC<{ size?: number; className?: string }>

const BRAND_ICONS: Record<'oal' | 'mnn' | 'tgr' | 'lal' | 'ib', Record<string, IconComponent>> = {
  oal: oalIcons as unknown as Record<string, IconComponent>,
  mnn: mnnIcons as unknown as Record<string, IconComponent>,
  tgr: tgrIcons as unknown as Record<string, IconComponent>,
  lal: lalIcons as unknown as Record<string, IconComponent>,
  ib:  ibIcons  as unknown as Record<string, IconComponent>,
}

const ALL_BRAND_ICON_NAMES: string[] = Array.from(
  new Set(
    Object.values(BRAND_ICONS).flatMap((set) =>
      Object.entries(set).filter(([, v]) => typeof v === 'function').map(([k]) => k),
    ),
  ),
).sort()

// ── Static data ───────────────────────────────────────────────────────────────

const THEME_KEYS = ['TGR', 'OAL', 'LAL', 'IB', 'MNN']

const NAV_SECTIONS = [
  { id: 'colors',      label: 'Colors' },
  { id: 'buttons',     label: 'Buttons' },
  { id: 'ribbons',     label: 'Ribbons & Price' },
  { id: 'inputs',      label: 'Inputs' },
  { id: 'typography',  label: 'Typography' },
  { id: 'spacing',     label: 'Spacing' },
  { id: 'radius',      label: 'Radius' },
  { id: 'shadows',     label: 'Shadows' },
  { id: 'zindex',      label: 'Z-Index' },
  { id: 'breakpoints', label: 'Breakpoints' },
  { id: 'icons',       label: 'Icons' },
]

const COLOR_GROUPS: { group: string; tokens: readonly (readonly [string, string])[] }[] = [
  {
    group: 'Brand',
    tokens: [
      ['--colors-brand-default-primary',   'brand/primary'],
      ['--colors-brand-default-secondary', 'brand/secondary'],
      ['--colors-background',              'background'],
    ],
  },
  {
    group: 'Surfaces',
    tokens: [
      ['--colors-surface-primary',   'surface/primary'],
      ['--colors-surface-secondary', 'surface/secondary'],
      ['--colors-surface-disabled',  'surface/disabled'],
    ],
  },
  {
    group: 'Text',
    tokens: [
      ['--colors-text',           'text'],
      ['--colors-text-secondary', 'text/secondary'],
      ['--colors-text-inverse',   'text/inverse'],
      ['--colors-text-disabled',  'text/disabled'],
    ],
  },
  {
    group: 'Status',
    tokens: [
      ['--colors-success', 'success'],
      ['--colors-error',   'error'],
      ['--colors-warning', 'warning'],
    ],
  },
  {
    group: 'UI',
    tokens: [
      ['--border-color',         'border'],
      ['--colors-card-image-bg', 'card/image-bg'],
      ['--colors-price-selling', 'price/selling'],
    ],
  },
  {
    group: 'Form Fields',
    tokens: [
      ['--form-field-background',   'field/bg'],
      ['--form-field-border-color', 'field/border'],
      ['--form-input-placeholder',  'field/placeholder'],
    ],
  },
]

const MATERIAL_COLORS = [
  { varName: '--sterling-silver-925',   label: 'Sterling Silver 925' },
  { varName: '--gold-vermeil-18k',      label: 'Gold Vermeil 18k' },
  { varName: '--solid-gold-10k',        label: 'Solid Gold 10k' },
  { varName: '--solid-gold-14k',        label: 'Solid Gold 14k' },
  { varName: '--white-gold-10k',        label: 'White Gold 10k' },
  { varName: '--white-gold-14k',        label: 'White Gold 14k' },
  { varName: '--rose-gold-plating-18k', label: 'Rose Gold 18k' },
  { varName: '--rose-gold-14k',         label: 'Rose Gold 14k' },
]

const BUTTON_DEMOS: { label: string; variant: ButtonVariant; disabled?: boolean; note: string }[] = [
  { label: 'Primary',     variant: 'primary',        note: '--buttons-primary-* · button1' },
  { label: 'Secondary',   variant: 'secondary',      note: '--buttons-secondary-* · button1' },
  { label: 'Add to Cart', variant: 'add-to-cart',    note: '--buttons-add-to-cart-* · button1' },
  { label: 'Upsell',      variant: 'upsell-primary', note: '--buttons-upsell-primary-* · text1' },
  { label: 'Link',        variant: 'link',            note: 'text1 + underline' },
  { label: 'Disabled',    variant: 'primary',         disabled: true, note: 'primary · disabled=true' },
]

const RIBBON_VARIANTS = [
  { label: 'Default',   bgVar: '--ribbon-background',           textVar: '--ribbon-text' },
  { label: 'Bundle',    bgVar: '--ribbon-bundle-background',    textVar: '--ribbon-bundle-text' },
  { label: 'OOS',       bgVar: '--ribbon-oos-background',       textVar: '--ribbon-oos-text' },
  { label: 'Secondary', bgVar: '--ribbon-secondary-background', textVar: '--ribbon-secondary-text' },
]

const TYPOGRAPHY_GROUPS = [
  {
    label: 'Headlines',
    scales: [
      'headline1','headline2','headline3','headline4','headline5','headline6',
      'headline7','headline8','headline9','headline10','headline11','headline12',
    ],
  },
  {
    label: 'Text',
    scales: ['text1','text2','text3','text4','text5','text6','text7','text8','text9'],
  },
  {
    label: 'Paragraphs',
    scales: ['paragraph1','paragraph2','paragraph3','paragraph4'],
  },
  {
    label: 'UI & Labels',
    scales: ['caption1','caption2','links1','button1','button2','disclaimer1','disclaimer2','ribbons1'],
  },
]

const SPACING_TOKENS = [
  { token: '--spacing-xxxs', label: 'xxxs', px: 2 },
  { token: '--spacing-xxxs',  label: 'xxs',  px: 4 },
  { token: '--spacing-xxs',   label: 'xs',   px: 8 },
  { token: '--spacing-xs',   label: 'sm',   px: 12 },
  { token: '--spacing-sm',   label: 'md',   px: 16 },
  { token: '--spacing-md',   label: 'lg',   px: 24 },
  { token: '--spacing-lg',   label: 'xl',   px: 32 },
  { token: '--spacing-2xl',  label: '2xl',  px: 48 },
  { token: '--spacing-3xl',  label: '3xl',  px: 64 },
  { token: '--spacing-4xl',  label: '4xl',  px: 96 },
]

const RADIUS_BASE_TOKENS = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-full',
  '--radius-panel',
]

const RADIUS_COMPONENT_TOKENS = [
  { varName: '--buttons-primary-border-radius', label: 'button/primary' },
  { varName: '--form-field-border-radius',      label: 'input' },
  { varName: '--ribbon-border-radius',          label: 'ribbon' },
]

const Z_INDEX_TOKENS = [
  { varName: '--z-base',    value: 0,   description: 'Normal document flow' },
  { varName: '--z-raised',  value: 10,  description: 'Hover states, card overlays' },
  { varName: '--z-sticky',  value: 100, description: 'Sticky add-to-cart bar' },
  { varName: '--z-header',  value: 200, description: 'Site header + topbar' },
  { varName: '--z-cart',    value: 300, description: 'Floating cart panel' },
  { varName: '--z-overlay', value: 400, description: 'Modal backdrop' },
  { varName: '--z-modal',   value: 500, description: 'Modal / dialog' },
  { varName: '--z-toast',   value: 600, description: 'Toast notifications' },
  { varName: '--z-tooltip', value: 700, description: 'Tooltips — always topmost' },
]

const SITE_HEADER_OFFSET = 'calc(var(--topline-height) + var(--layout-header-height))'
const THEME_BAR_HEIGHT = 46

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ num, label }: { num: string; label: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#808080', marginBottom: 28 }}>
      {num} — {label}
    </p>
  )
}

function SubLabel({ label }: { label: string }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: '#808080', margin: '20px 0 10px' }}>{label}</p>
  )
}

function ColorSwatch({ varName, label, themeKey }: { varName: string; label: string; themeKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [resolved, setResolved] = useState('')

  useEffect(() => {
    if (ref.current) {
      setResolved(getComputedStyle(ref.current).getPropertyValue(varName).trim())
    }
  }, [varName, themeKey])

  return (
    <div style={{ width: 'max-content', minWidth: 64 }}>
      <div
        ref={ref}
        style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '1px solid var(--border-color)',
          background: `var(${varName})`,
          marginBottom: 6,
        }}
      />
      <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.4, color: 'var(--colors-text)' }}>{label}</div>
      <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>{varName}</div>
      {resolved && <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>{resolved}</div>}
    </div>
  )
}

function TypeRow({ scale }: { scale: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr', alignItems: 'center',
      gap: 20, padding: '10px 0', borderBottom: '1px solid var(--border-color)',
    }}>
      <code style={{
        fontSize: 10, background: 'var(--colors-surface-primary)',
        padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace',
        display: 'inline-block', color: 'var(--colors-text)',
        alignSelf: 'flex-start', marginTop: 4,
      }}>
        {scale}
      </code>
      <div style={{
        fontFamily:    `var(--typography-rules-${scale}-font-family)`,
        fontSize:      `var(--typography-rules-${scale}-font-size)`,
        lineHeight:    `var(--typography-rules-${scale}-line-height)`,
        fontWeight:    `var(--typography-rules-${scale}-font-weight, normal)` as React.CSSProperties['fontWeight'],
        letterSpacing: `var(--typography-rules-${scale}-letter-spacing, normal)`,
        textTransform: `var(--typography-rules-${scale}-text-transform, none)` as React.CSSProperties['textTransform'],
        color:         'var(--colors-text)',
      }}>
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  )
}

function RadiusDemo({ varName, label, themeKey }: { varName: string; label: string; themeKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [resolved, setResolved] = useState('')

  useEffect(() => {
    if (ref.current) {
      setResolved(getComputedStyle(ref.current).getPropertyValue(varName).trim())
    }
  }, [varName, themeKey])

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        ref={ref}
        style={{
          width: 80, height: 80,
          background: 'var(--colors-surface-secondary)',
          border: '2px solid var(--border-color)',
          borderRadius: `var(${varName})`,
          margin: '0 auto 8px',
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: 'var(--colors-brand-default-primary)', display: 'block' }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: '#808080', fontFamily: 'monospace' }}>{resolved}</span>
    </div>
  )
}

function ThemeInput({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0 14px',
        background: 'var(--form-field-background)',
        border: '1px solid',
        borderColor: hovered ? 'var(--form-field-border-color-hover)' : 'var(--form-field-border-color)',
        borderRadius: 'var(--form-field-border-radius)',
        color: 'var(--colors-text)',
        fontFamily: 'var(--font-family-main-regular)',
        fontSize: 'var(--typography-rules-text1-font-size)',
        lineHeight: 'var(--typography-rules-text1-line-height)',
        minHeight: 'var(--field-min-height)',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
        boxSizing: 'border-box',
      }}
    />
  )
}

function ThemeSelect() {
  const [hovered, setHovered] = useState(false)
  return (
    <select
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0 14px',
        background: 'var(--form-field-background)',
        border: '1px solid',
        borderColor: hovered ? 'var(--form-field-border-color-hover)' : 'var(--form-field-border-color)',
        borderRadius: 'var(--form-field-border-radius)',
        color: 'var(--colors-text)',
        fontFamily: 'var(--font-family-main-regular)',
        fontSize: 'var(--typography-rules-text1-font-size)',
        minHeight: 'var(--field-min-height)',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
        cursor: 'pointer',
        appearance: 'none',
        boxSizing: 'border-box',
      }}
    >
      <option>Option One</option>
      <option>Option Two</option>
      <option>Option Three</option>
    </select>
  )
}

function ThemeTextarea() {
  const [hovered, setHovered] = useState(false)
  return (
    <textarea
      rows={3}
      placeholder="Write your message…"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '10px 14px',
        background: 'var(--form-field-background)',
        border: '1px solid',
        borderColor: hovered ? 'var(--form-field-border-color-hover)' : 'var(--form-field-border-color)',
        borderRadius: 'var(--form-field-border-radius)',
        color: 'var(--colors-text)',
        fontFamily: 'var(--font-family-main-regular)',
        fontSize: 'var(--typography-rules-text1-font-size)',
        lineHeight: 'var(--typography-rules-text1-line-height)',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color var(--transition-fast)',
        boxSizing: 'border-box',
      }}
    />
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

interface StyleguideClientProps {
  brand: BrandKey
}

export default function StyleguideClient({ brand }: StyleguideClientProps) {
  const router = useRouter()
  const [activeTheme, setActiveTheme] = useState(() => brandToThemeKey(brand))
  const [activeSection, setActiveSection] = useState('colors')

  useEffect(() => {
    setActiveTheme(brandToThemeKey(brand))
  }, [brand])

  const handleThemeChange = (key: string) => {
    setActiveTheme(key)
    router.replace(`/styleguide?brand=${themeKeyToBrand(key)}`, { scroll: false })
  }

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[data-section]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection((e.target as HTMLElement).dataset.section ?? '')
        })
      },
      { threshold: 0.2 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const activeBrand = themeKeyToBrand(activeTheme) as BrandKey

  return (
    <div
      data-theme={activeBrand}
      style={{ background: 'var(--colors-background)', color: 'var(--colors-text)', margin: 0 }}
    >

      {/* ── Header ── */}
      <header style={{
        background: 'var(--colors-background)',
        padding: '28px 64px 24px',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.08em', opacity: 0.45, marginBottom: 5 }}>
          Tenengroup Design System · 5 Brand Themes · Source: Figma → Tenengroup — Design System → tokens.json
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>Style Guide</h1>
        <p style={{ fontSize: 12, opacity: 0.4, fontFamily: 'monospace', marginTop: 5 }}>
          tokens.json extracted 2026-05-25 · 4 Figma variable collections · Color · Radius · Spacing · Fonts
        </p>
      </header>

      {/* ── Theme switcher ── */}
      <div style={{
        background: 'var(--colors-background)',
        borderBottom: '1px solid var(--border-color)',
        padding: '10px 64px',
        display: 'flex', alignItems: 'center', gap: 8,
        position: 'sticky', top: SITE_HEADER_OFFSET, zIndex: 40,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--colors-text-secondary)', marginRight: 4 }}>
          Theme
        </span>
        {THEME_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            style={{
              padding: '5px 14px', borderRadius: 100, border: '1px solid',
              borderColor: activeTheme === key ? 'var(--colors-text)' : 'var(--border-color)',
              background:  activeTheme === key ? 'var(--colors-text)' : 'transparent',
              color:       activeTheme === key ? 'var(--colors-background)' : 'var(--colors-text-secondary)',
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
        background: 'var(--colors-surface-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 64px',
        display: 'flex', gap: 0,
        position: 'sticky', top: `calc(${SITE_HEADER_OFFSET} + ${THEME_BAR_HEIGHT}px)`, zIndex: 39,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {NAV_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            style={{
              display: 'block', whiteSpace: 'nowrap', padding: '13px 16px',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none',
              color: activeSection === id ? 'var(--colors-text)' : 'var(--colors-text-secondary)',
              borderBottom: activeSection === id
                ? '2px solid var(--colors-brand-default-primary)'
                : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 64px 80px' }}>

        {/* ── 01 Colors ── */}
        <section data-section="colors" id="colors" style={{ paddingTop: 52 }}>
          <SectionLabel num="01" label="Colors" />

          {COLOR_GROUPS.map(({ group, tokens }) => (
            <div key={group}>
              <SubLabel label={group} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 4 }}>
                {tokens.map(([varName, label]) => (
                  <ColorSwatch key={varName} varName={varName} label={label} themeKey={activeTheme} />
                ))}
              </div>
            </div>
          ))}

          <SubLabel label="Materials — product swatch colors (shared, not brand-themed)" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {MATERIAL_COLORS.map(({ varName, label }) => (
              <ColorSwatch key={varName} varName={varName} label={label} themeKey={activeTheme} />
            ))}
          </div>
        </section>

        {/* ── 02 Buttons ── */}
        <section data-section="buttons" id="buttons" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="02" label="Button Variants" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
            {BUTTON_DEMOS.map(({ label, variant, disabled, note }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--colors-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </div>
                <Button variant={variant} disabled={disabled}>{label}</Button>
                <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>{note}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'var(--colors-surface-primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 11, color: 'var(--colors-text-secondary)', fontFamily: 'monospace', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--colors-text)', fontFamily: 'inherit' }}>Typography exception:</strong>{' '}
            <code>upsell-primary</code> and <code>link</code> use <code>--typography-rules-text1-*</code>.
            All other variants use <code>{'--buttons-{variant}-font-*'}</code> (resolved from the button1 scale).
          </div>
        </section>

        {/* ── 03 Ribbons & Price ── */}
        <section data-section="ribbons" id="ribbons" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="03" label="Ribbons &amp; Price" />

          <SubLabel label="Ribbon variants" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {RIBBON_VARIANTS.map(({ label, bgVar, textVar }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--colors-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </div>
                <div style={{
                  padding: '4px 12px',
                  background: `var(${bgVar})`,
                  color: `var(${textVar})`,
                  borderRadius: 'var(--ribbon-border-radius)',
                  fontFamily: 'var(--typography-rules-ribbons1-font-family)',
                  fontSize: 'var(--typography-rules-ribbons1-font-size)',
                  lineHeight: 'var(--typography-rules-ribbons1-line-height)',
                  fontWeight: 'var(--typography-rules-ribbons1-font-weight, 400)' as React.CSSProperties['fontWeight'],
                  letterSpacing: 'var(--typography-rules-ribbons1-letter-spacing, normal)',
                  textTransform: 'var(--typography-rules-ribbons1-text-transform, none)' as React.CSSProperties['textTransform'],
                  display: 'inline-block', width: 'fit-content',
                  border: '1px solid var(--border-color)',
                }}>
                  {label}
                </div>
                <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>
                  {bgVar}
                </div>
              </div>
            ))}
          </div>

          <SubLabel label="Price" />
          {[
            { label: 'With discount', showCrossed: true, showDiscount: true },
            { label: 'Selling only',  showCrossed: false, showDiscount: false },
          ].map(({ label, showCrossed, showDiscount }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{
                fontFamily: 'var(--font-family-main-bold)',
                fontSize: 'var(--typography-rules-text2-font-size)',
                lineHeight: 'var(--typography-rules-text2-line-height)',
                fontWeight: 'var(--typography-rules-text2-font-weight, 700)' as React.CSSProperties['fontWeight'],
                color: 'var(--colors-price-selling)',
              }}>
                $99.00
              </span>
              {showCrossed && (
                <span style={{
                  fontFamily: 'var(--font-family-main-regular)',
                  fontSize: 'var(--typography-rules-text1-font-size)',
                  color: 'var(--colors-text-secondary)',
                  textDecoration: 'line-through',
                }}>
                  $149.00
                </span>
              )}
              {showDiscount && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  color: 'var(--colors-text)',
                  background: 'var(--colors-surface-primary)',
                }}>
                  –33%
                </span>
              )}
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--colors-text-secondary)', marginLeft: 8 }}>
                {showDiscount
                  ? '--colors-price-selling · --colors-text-secondary (crossed) · --colors-surface-primary (badge)'
                  : '--colors-price-selling'}
              </span>
            </div>
          ))}
        </section>

        {/* ── 04 Inputs ── */}
        <section data-section="inputs" id="inputs" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="04" label="Form Inputs" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, maxWidth: 800 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--colors-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Text Input
              </div>
              <ThemeInput placeholder="Placeholder text" />
              <div style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace', marginTop: 4 }}>
                --form-field-background · --form-field-border-color · hover → --form-field-border-color-hover
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--colors-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                With Value
              </div>
              <ThemeInput defaultValue="user@example.com" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--colors-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Select
              </div>
              <ThemeSelect />
            </div>
            <div style={{ flex: '0 0 100%' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--colors-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Textarea
              </div>
              <ThemeTextarea />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--colors-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Checkbox
              </div>
              {(['Checked', 'Unchecked'] as const).map((state, i) => (
                <label key={state} style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-family-main-regular)',
                  fontSize: 'var(--typography-rules-text1-font-size)',
                  color: 'var(--colors-text)',
                  marginTop: i > 0 ? 8 : 0,
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={state === 'Checked'}
                    style={{ accentColor: 'var(--colors-text)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  {state}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ── 05 Typography ── */}
        <section data-section="typography" id="typography" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="05" label="Typography" />

          <SubLabel label="Font Families" />
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 28 }}>
            {[
              { label: '--font-family-main-regular',       varName: '--font-family-main-regular',      fontWeight: 400 },
              { label: '--font-family-main-bold',          varName: '--font-family-main-bold',          fontWeight: 700 },
              { label: '--font-family-main-light',         varName: '--font-family-main-light',         fontWeight: 300 },
              { label: '--font-family-secondary-regular',  varName: '--font-family-secondary-regular',  fontWeight: 400 },
              { label: '--font-family-tertiary-regular',   varName: '--font-family-tertiary-regular',   fontWeight: 400 },
            ].map(({ label, varName, fontWeight }) => (
              <div key={label} style={{ minWidth: 200 }}>
                <code style={{ fontSize: 9, color: 'var(--colors-text-secondary)', fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>
                  {label}
                </code>
                <div style={{ fontFamily: `var(${varName})`, fontWeight, fontSize: 20, color: 'var(--colors-text)' }}>
                  The quick brown fox
                </div>
              </div>
            ))}
          </div>

          {TYPOGRAPHY_GROUPS.map(({ label, scales }) => (
            <div key={label}>
              <SubLabel label={label} />
              {scales.map((scale) => <TypeRow key={scale} scale={scale} />)}
            </div>
          ))}
        </section>

        {/* ── 06 Spacing ── */}
        <section data-section="spacing" id="spacing" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="06" label="Spacing" />
          <div style={{ maxWidth: 500 }}>
            {SPACING_TOKENS.map(({ token, label, px }) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ width: 80, fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--colors-text)' }}>
                  {label}
                </span>
                <span style={{ width: 44, fontSize: 12, color: 'var(--colors-text-secondary)', fontFamily: 'monospace' }}>
                  {px}px
                </span>
                <div style={{
                  height: 20,
                  width: `var(${token})`,
                  minWidth: 2,
                  background: 'var(--colors-brand-default-primary)',
                  borderRadius: 3,
                  flexShrink: 0,
                }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--colors-text-secondary)', fontFamily: 'monospace', marginTop: 16 }}>
            Shared across all brands — never overridden per theme
          </p>
        </section>

        {/* ── 07 Radius ── */}
        <section data-section="radius" id="radius" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="07" label="Border Radius" />

          <SubLabel label="Base scale — per brand" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            {RADIUS_BASE_TOKENS.map((varName) => (
              <RadiusDemo key={varName} varName={varName} label={varName.replace('--radius-', '')} themeKey={activeTheme} />
            ))}
          </div>

          <SubLabel label="Component tokens — per brand" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
            {RADIUS_COMPONENT_TOKENS.map(({ varName, label }) => (
              <RadiusDemo key={varName} varName={varName} label={label} themeKey={activeTheme} />
            ))}
          </div>
        </section>

        {/* ── 08 Shadows ── */}
        <section data-section="shadows" id="shadows" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="08" label="Shadows" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, padding: '24px 0' }}>
            {[
              { varName: '--shadow-sm', label: 'sm' },
              { varName: '--shadow-md', label: 'md' },
            ].map(({ varName, label }) => (
              <div key={varName} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 60,
                  background: 'var(--colors-background)',
                  borderRadius: 'var(--radius-md)',
                  margin: '0 auto 12px',
                  boxShadow: `var(${varName})`,
                  border: '1px solid var(--border-color)',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: 'var(--colors-text)', display: 'block' }}>
                  {label}
                </span>
                <span style={{ fontSize: 9, color: '#808080', fontFamily: 'monospace' }}>{varName}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--colors-text-secondary)', fontFamily: 'monospace' }}>
            Shared across all brands — never overridden per theme
          </p>
        </section>

        {/* ── 09 Z-Index ── */}
        <section data-section="zindex" id="zindex" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="09" label="Z-Index Layers" />
          <div style={{ maxWidth: 620 }}>
            {Z_INDEX_TOKENS.map(({ varName, value, description }) => (
              <div key={varName} style={{
                display: 'grid', gridTemplateColumns: '170px 56px 1fr', alignItems: 'center',
                gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border-color)',
              }}>
                <code style={{
                  fontSize: 11, fontFamily: 'monospace', color: 'var(--colors-text)',
                  background: 'var(--colors-surface-primary)', padding: '2px 6px', borderRadius: 4,
                }}>
                  {varName}
                </code>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--colors-brand-default-primary)' }}>
                  {value}
                </span>
                <span style={{ fontSize: 12, color: 'var(--colors-text-secondary)' }}>{description}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--colors-text-secondary)', fontFamily: 'monospace', marginTop: 16 }}>
            Shared across all brands. Never use raw z-index numbers in components — always use <code>var(--z-*)</code>.
          </p>
        </section>

        {/* ── 10 Breakpoints ── */}
        <section data-section="breakpoints" id="breakpoints" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="10" label="Breakpoints" />
          <div style={{ maxWidth: 680 }}>
            {[
              { token: 'sm',  val: '640px',  pct: '44.4%' },
              { token: 'md',  val: '768px',  pct: '53.3%' },
              { token: 'lg',  val: '1024px', pct: '71.1%' },
              { token: 'xl',  val: '1280px', pct: '88.9%' },
              { token: '2xl', val: '1440px', pct: '100%'  },
            ].map(({ token, val, pct }) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ width: 48, fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--colors-text)' }}>{token}</span>
                <span style={{ width: 56, fontSize: 12, color: 'var(--colors-text-secondary)', fontFamily: 'monospace' }}>{val}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--colors-surface-primary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct, background: 'var(--colors-brand-default-primary)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--colors-text-secondary)', fontFamily: 'monospace', marginTop: 16 }}>
            Tailwind CSS breakpoints. Build mobile-first — base = mobile, <code>md:</code> = tablet, <code>lg:</code> = desktop.
          </p>
        </section>

        {/* ── 11 Icons ── */}
        <section data-section="icons" id="icons" style={{ paddingTop: 52, borderTop: '1px solid var(--border-color)', marginTop: 8 }}>
          <SectionLabel num="11" label="Icons" />
          <p style={{ fontSize: 11, color: 'var(--colors-text-secondary)', margin: '0 0 16px' }}>
            Per-brand icon set. Updates with the brand switcher. Dashed cells indicate icons missing in the current brand.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 'var(--spacing-sm)',
            color: 'var(--colors-text)',
          }}>
            {ALL_BRAND_ICON_NAMES.map((name) => {
              const brandSlug = themeKeyToBrand(activeTheme) as keyof typeof BRAND_ICONS
              const Icon = BRAND_ICONS[brandSlug]?.[name]
              const missing = typeof Icon !== 'function'
              return (
                <div key={name} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 8, padding: 8,
                }}>
                  {missing ? (
                    <div
                      style={{ width: 24, height: 24, border: '1px dashed var(--border-color)', borderRadius: 4 }}
                      role="img"
                      aria-label={`${name} (missing in this brand)`}
                    />
                  ) : (
                    <Icon size={24} />
                  )}
                  <code style={{
                    fontFamily:    'var(--typography-rules-caption1-font-family)',
                    fontSize:      'var(--typography-rules-caption1-font-size)',
                    lineHeight:    'var(--typography-rules-caption1-line-height)',
                    fontWeight:    'var(--typography-rules-caption1-font-weight)' as React.CSSProperties['fontWeight'],
                    letterSpacing: 'var(--typography-rules-caption1-letter-spacing)',
                    color:         'var(--colors-text)',
                    opacity:       missing ? 0.45 : 1,
                    wordBreak:     'break-word',
                  }}>
                    {name}
                  </code>
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
