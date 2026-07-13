'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { CartItem } from '../_context/CartContext'
import type { ProductItem } from '../../../data/products'
import { SONG_CATALOG, getSongById } from '../../../data/songs'
import { CustomizerPanel, useIsMobile } from '../_components/CustomizerPanel'
import pdp from './ProductDetailPage.module.css'
import styles from './MusicMemoriesCustomizer.module.css'

// ─── Types ──────────────────────────────────────────────────────────────────
type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

interface CustomizerIcons {
  ChevronIcon: IconCmp
  StarIcon: IconCmp
  [key: string]: IconCmp | undefined
}

interface MusicMemoriesCustomizerProps {
  brand: string
  product: ProductItem
  icons: CustomizerIcons
  addItem: (item: CartItem) => void
  openCart: () => void
  onLivePreviewChange?: (image: string | null) => void
}

type FrameType = 'canvas' | 'metal' | 'acrylic'
type Phase = 'default' | 'flow' | 'saved'
type Tab = 'personalize' | 'customize'

// ─── Data (ported 1:1 from limeandlou/live-preview.js) ──────────────────────

const SIZE_OPTIONS = [
  { value: '9x12', label: 'XS – 9" x 12"' },
  { value: '12x16', label: 'S – 12" x 16"' },
  { value: '18x24', label: 'M – 18" x 24"' },
  { value: '24x32', label: 'L – 24" x 32"' },
  { value: '30x40', label: 'XL – 30" x 40"' },
] as const

const SIZE_CANVAS_PRICE_CENTS: Record<string, number> = {
  '9x12': 5000, '12x16': 7500, '18x24': 12000, '24x32': 14500, '30x40': 19000,
}

const FRAME_PREMIUM_CENTS: Record<FrameType, number> = { canvas: 0, metal: 7500, acrylic: 11500 }

// Photoreal frame mockups — the selected frame color swaps the background image.
// Non-canvas frame types fall back to the white mockup.
const FRAME_COLOR_IMAGES: Record<string, string> = {
  white:        '/images/lal/frame-colors/White.jpg',
  black:        '/images/lal/frame-colors/Black.jpg',
  'wood-light': '/images/lal/frame-colors/LightWood.jpg',
  'wood-dark':  '/images/lal/frame-colors/DarkWood.jpg',
}

// Grey canvas window inside the (square) frame mockups, as fractions of the image.
// Measured from the assets so the artwork lands exactly inside the frame opening.
const CANVAS_WINDOW = { x: 0.2065, y: 0.1135, w: 0.584, h: 0.774 }

const CENTER_COLORS = [
  { value: 'purple', label: 'Purple', hex: '#A46C93', hint: '(Most Popular)' },
  { value: 'orange', label: 'Orange', hex: '#DC7957' },
  { value: 'blue', label: 'Blue', hex: '#57BADD' },
  { value: 'green', label: 'Green', hex: '#91A36B' },
] as const

const FRAME_COLORS: { value: string; label: string; hex: string; light?: boolean }[] = [
  { value: 'white', label: 'White', hex: '#FFFFFF', light: true },
  { value: 'black', label: 'Black', hex: '#1F1F1F' },
  { value: 'wood-light', label: 'Light wood', hex: '#D4A574' },
  { value: 'wood-dark', label: 'Dark wood', hex: '#5C4033' },
]

const FRAME_TYPES: { value: FrameType; label: string; thumb: string }[] = [
  { value: 'canvas', label: 'Canvas', thumb: '/images/lal/music-memories/Canvas.png' },
  { value: 'metal', label: 'Metal', thumb: '/images/lal/music-memories/Metal.png' },
  { value: 'acrylic', label: 'Acrylic', thumb: '/images/lal/music-memories/Acrylic.png' },
]

const SLIPMAT = {
  name: 'Music Memories Custom Slipmat',
  priceCents: 1500,
  originalCents: 3000,
  image: '/images/lal/music-memories/slipmat-upsell.png',
}

// Placeholder shown on the record groove (no lyrics API). Edit here to change the copy.
const RING_COPY = 'YOUR SONG LYRICS WILL APPEAR HERE'

const LAL_RATING = 4.9
const LAL_REVIEW_COUNT = 1024

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

function defaultFrameForProduct(product: ProductItem): FrameType {
  const n = product.name.toLowerCase()
  if (n.includes('acrylic')) return 'acrylic'
  if (n.includes('metal')) return 'metal'
  return 'canvas'
}

// ─── Spiral groove path ─────────────────────────────────────────────────────
// One continuous spiral (like a record groove) so the placeholder text flows
// without the wedge seam that concentric rings create.
function buildSpiralPath(
  cx: number, cy: number,
  rOuter: number, rInner: number,
  turns: number, stepsPerTurn = 120,
): { d: string; length: number } {
  const totalSteps = Math.round(turns * stepsPerTurn)
  let d = ''
  let length = 0
  let px = 0, py = 0
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps
    const angle = turns * 2 * Math.PI * t - Math.PI / 2 // start at 12 o'clock
    const r = rOuter - (rOuter - rInner) * t
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2)
    if (i > 0) length += Math.hypot(x - px, y - py)
    px = x; py = y
  }
  return { d, length }
}

const SPIRAL_FONT_SIZE = 5

function buildCenterTitleLines(center: string[] | null): string[] {
  const def = ['PICK YOUR', 'SONG TITLE']
  if (!center || !center.length) return def.slice()
  const parts = center.map(s => String(s || '').trim().toUpperCase()).filter(Boolean)
  if (parts.length >= 3) return parts.slice(0, 3)
  if (parts.length === 2) return parts
  if (parts.length === 1) {
    const one = parts[0]
    const maxW = 11
    if (one.length <= maxW) return [one]
    const words = one.split(/\s+/).filter(Boolean)
    if (words.length > 1) {
      const out: string[] = []
      let line = ''
      for (const ww of words) {
        const cand = line ? `${line} ${ww}` : ww
        if (cand.length <= maxW + 2) line = cand
        else { if (line) out.push(line); line = ww }
      }
      if (line) out.push(line)
      if (out.length <= 3) return out
      return [out[0], out[1], out.slice(2).join(' ').slice(0, maxW + 4)]
    }
    const chop: string[] = []
    for (let ch = 0; ch < one.length && chop.length < 3; ch += maxW) chop.push(one.slice(ch, ch + maxW))
    return chop
  }
  return def.slice()
}

// ─── Vinyl artwork SVG (canvas print only — the frame comes from the mockup) ──

interface VinylPreviewProps {
  idSuffix: string
  songTitle: string
  memory: string
  names: string
  centerHex: string
}

function VinylPreviewSvg({ idSuffix, songTitle, memory, names, centerHex }: VinylPreviewProps) {
  const titleLines = buildCenterTitleLines(songTitle.trim() ? [songTitle] : null)

  // Center title layout (ported from layoutPreviewCenterTitle)
  const cy = 232
  const fs = 12
  const lh = 14
  const n = titleLines.length
  const firstY = n === 1 ? cy + fs * 0.32 : n === 2 ? cy - lh / 2 + fs * 0.2 : cy - lh + fs * 0.18

  // One continuous spiral groove matching the old ring band (r 101 → 54, 7 turns).
  const spiralId = `mm-spiral-${idSuffix}`
  const spiral = buildSpiralPath(200, 232, 101, 54, 7)
  const phrase = `${RING_COPY} · `
  const approxCharWidth = SPIRAL_FONT_SIZE * 0.62
  const targetChars = Math.ceil((spiral.length / approxCharWidth) * 1.15) // slight overfill
  let spiralText = ''
  while (spiralText.length < targetChars) spiralText += phrase

  // Explicit width/height (2.5× the viewBox) gives a crisp raster when composited.
  return (
    <svg
      className="mm-preview-svg"
      width="1000"
      height="1350"
      viewBox="0 0 400 540"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Live personalization preview"
    >
      <defs>
        <path id={spiralId} fill="none" d={spiral.d} />
      </defs>
      {/* Printed canvas surface — fills the frame opening */}
      <rect x="0" y="0" width="400" height="540" fill="#FAF9F6" />
      {/* Record scaled up (~1.3×) around its center to match the product artwork size */}
      <g transform="translate(200 238) scale(1.3) translate(-200 -232)">
        <circle cx="200" cy="232" r="112" fill="#0d0d0d" />
        <circle cx="200" cy="232" r="104" fill="#121212" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
        <circle cx="200" cy="232" r="96" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <circle cx="200" cy="232" r="88" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <circle cx="200" cy="232" r="80" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.5" />
        <text fill="#FFFFFF" fontFamily="Georgia,serif" fontSize={SPIRAL_FONT_SIZE} letterSpacing="0.04em">
          <textPath href={`#${spiralId}`}>{spiralText}</textPath>
        </text>
        <circle cx="200" cy="232" r="48" fill={centerHex} />
        <text x="200" y={firstY} textAnchor="middle" fill="#FFFFFF" fontFamily="'EB Garamond', Garamond, serif" fontSize={fs} fontWeight="700" letterSpacing="0.06em">
          {titleLines.map((line, li) => (
            <tspan key={li} x="200" dy={li === 0 ? 0 : lh}>{line}</tspan>
          ))}
        </text>
      </g>
      <text x="200" y="448" textAnchor="middle" fill="#1F1F1F" fontSize="15" fontFamily="'EB Garamond', Garamond, serif" fontWeight="600">
        {memory.trim() || 'Your memory'}
      </text>
      <line x1="113" y1="462" x2="287" y2="462" stroke="#CFCFCF" strokeWidth="1" />
      <text x="200" y="492" textAnchor="middle" fill="#333333" fontSize="18" fontFamily="'Pinyon Script', cursive" fontWeight="400">
        {names.trim() || 'Names or special date'}
      </text>
    </svg>
  )
}

// ─── Framed-mockup compositing ────────────────────────────────────────────────
// Draws the selected frame photo, then lays the artwork SVG into its grey opening.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function composeFramedPreview(frameSrc: string, artworkSvg: SVGSVGElement): Promise<string | null> {
  const frameImg = await loadImage(frameSrc)
  const artSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(artworkSvg))}`
  const artImg = await loadImage(artSrc)

  const W = 1400
  const H = Math.round((frameImg.naturalHeight / frameImg.naturalWidth) * W) || W
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Frame photo first (its opening is opaque grey), then the artwork laid into
  // the measured grey window so it sits inside the frame opening.
  ctx.drawImage(frameImg, 0, 0, W, H)
  const rx = CANVAS_WINDOW.x * W
  const ry = CANVAS_WINDOW.y * H
  const rw = CANVAS_WINDOW.w * W
  const rh = CANVAS_WINDOW.h * H
  ctx.drawImage(artImg, rx, ry, rw, rh)
  return canvas.toDataURL('image/jpeg', 0.86)
}

// ─── Song combobox ───────────────────────────────────────────────────────────

interface SongComboProps {
  id: string
  songId: string
  onSelect: (id: string) => void
  onClear: () => void
}

function SongCombo({ id, songId, onSelect, onClear }: SongComboProps) {
  const selected = songId ? getSongById(songId) : undefined
  const [query, setQuery] = useState(selected?.label ?? '')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(selected?.label ?? '')
  }, [selected?.label])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || (selected && q === selected.label.toLowerCase())) return SONG_CATALOG
    return SONG_CATALOG.filter(s => s.label.toLowerCase().includes(q))
  }, [query, selected])

  return (
    <div className={styles.songCombo} ref={wrapRef}>
      <div className={styles.songComboField}>
        <input
          type="text"
          id={id}
          className={styles.input}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          placeholder="Type to search songs…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
        />
        {songId && (
          <button
            type="button"
            className={styles.songComboClear}
            aria-label="Clear song selection"
            onClick={() => { onClear(); setQuery(''); setOpen(true) }}
          >×</button>
        )}
        <button
          type="button"
          className={styles.songComboToggle}
          aria-label="Open or close song list"
          tabIndex={-1}
          onClick={() => setOpen(o => !o)}
        >
          <svg
            className={`${styles.songComboChevron} ${open ? styles.songComboChevronOpen : ''}`}
            width="12" height="6" viewBox="0 0 12 8" aria-hidden="true"
          >
            <path fill="currentColor" d="M1.41 0L6 4.58 10.59 0 12 1.41l-6 6-6-6L1.41 0z" />
          </svg>
        </button>
      </div>
      {open && (
        <ul className={styles.songComboList} id={`${id}-list`} role="listbox">
          {matches.length === 0 && <li className={styles.songComboEmpty}>No songs match your search</li>}
          {matches.map(s => (
            <li
              key={s.id}
              role="option"
              aria-selected={s.id === songId}
              className={`${styles.songComboOption} ${s.id === songId ? styles.songComboOptionActive : ''}`}
              onClick={() => { onSelect(s.id); setOpen(false) }}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function MusicMemoriesCustomizer({ brand, product, icons, addItem, openCart, onLivePreviewChange }: MusicMemoriesCustomizerProps) {
  const { ChevronIcon, StarIcon, XIcon, PersonIcon, ShippingIcon, MapPinIcon, RevisionsIcon, ClipboardCopyIcon } = icons
  const RevisionsGlyph = RevisionsIcon ?? ClipboardCopyIcon
  const isMobile = useIsMobile()

  const [phase, setPhase] = useState<Phase>('default')
  const [tab, setTab] = useState<Tab>('personalize')
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [memory, setMemory] = useState('')
  const [names, setNames] = useState('')
  const [centerColor, setCenterColor] = useState<string>('orange')
  const [size, setSize] = useState('12x16')
  const [frameType, setFrameType] = useState<FrameType>(() => defaultFrameForProduct(product))
  const [frameColor, setFrameColor] = useState('black')
  const [frameListOpen, setFrameListOpen] = useState(false)
  const [slipmat, setSlipmat] = useState(false)

  const isCanvas = frameType === 'canvas'
  const centerHex = CENTER_COLORS.find(c => c.value === centerColor)?.hex ?? CENTER_COLORS[0].hex

  // Pricing (ported from getDisplayPrice): canvas price at size + frame premium.
  const priceForFrame = (frame: FrameType, sz: string) =>
    (SIZE_CANVAS_PRICE_CENTS[sz] ?? SIZE_CANVAS_PRICE_CENTS['12x16']) + FRAME_PREMIUM_CENTS[frame]
  const currentPrice = priceForFrame(frameType, size)
  const subtotal = currentPrice + (slipmat ? SLIPMAT.priceCents : 0)

  // Frame mockup image for the selected frame color (non-canvas → white mockup).
  const frameSrc = FRAME_COLOR_IMAGES[isCanvas ? frameColor : 'white'] ?? FRAME_COLOR_IMAGES.white

  // ── Live preview → gallery ─────────────────────────────────────────────────
  // Composite the framed mockup (frame photo + artwork inside the opening) and
  // feed it to the gallery. Kept as state so the inline preview + cart reuse it.
  const serializerRef = useRef<HTMLDivElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (phase === 'default') {
      setPreviewImage(null)
      onLivePreviewChange?.(null)
      return
    }
    const svg = serializerRef.current?.querySelector('svg')
    if (!svg) return
    let cancelled = false
    composeFramedPreview(frameSrc, svg as SVGSVGElement)
      .then(img => {
        if (cancelled || !img) return
        setPreviewImage(img)
        onLivePreviewChange?.(img)
      })
      .catch(() => { /* leave the previous preview on failure */ })
    return () => { cancelled = true }
  }, [phase, songTitle, memory, names, centerColor, frameSrc, onLivePreviewChange])

  useEffect(() => () => onLivePreviewChange?.(null), [onLivePreviewChange])

  // ── Add to bag ─────────────────────────────────────────────────────────────
  const handleAddToBag = () => {
    const image = previewImage ?? product.image

    const selectedOptions = [
      { label: 'Song', value: songTitle.trim() || '—' },
      { label: 'Artist', value: artist.trim() || '—' },
      { label: 'Memory', value: memory.trim() || '—' },
      { label: 'Names/Date', value: names.trim() || '—' },
      { label: 'Color', value: CENTER_COLORS.find(c => c.value === centerColor)?.label ?? '—' },
      { label: 'Size', value: SIZE_OPTIONS.find(s => s.value === size)?.label ?? size },
      { label: 'Frame', value: FRAME_TYPES.find(f => f.value === frameType)?.label ?? frameType },
      ...(isCanvas
        ? [{ label: 'Frame color', value: FRAME_COLORS.find(c => c.value === frameColor)?.label ?? frameColor }]
        : []),
    ]

    addItem({
      id: `mm-${product.id}-${Date.now()}`,
      name: product.name,
      price: currentPrice,
      image,
      isPersonalized: true,
      selectedOptions,
    })

    if (slipmat) {
      addItem({
        id: `mm-slipmat-${Date.now()}`,
        name: SLIPMAT.name,
        price: SLIPMAT.priceCents,
        originalPrice: SLIPMAT.originalCents,
        image: SLIPMAT.image,
        isPersonalized: false,
      })
    }

    setPhase('saved')
    openCart()
  }

  const filledStars = Math.round(LAL_RATING)

  const upsellCard = (idSuffix: string) => (
    <div className={styles.upsell}>
      <p className={styles.upsellEyebrow}>Limited time offer</p>
      <label
        className={`${styles.upsellCard} ${slipmat ? styles.upsellCardChecked : ''}`}
        htmlFor={`mm-upsell-${idSuffix}`}
      >
        <input
          type="checkbox"
          id={`mm-upsell-${idSuffix}`}
          className={styles.upsellInput}
          checked={slipmat}
          onChange={e => setSlipmat(e.target.checked)}
        />
        <span className={styles.upsellRow}>
          <span className={styles.upsellThumb}>
            <img src={SLIPMAT.image} alt="Music Memories custom slipmat" />
          </span>
          <span className={styles.upsellBody}>
            <span className={styles.upsellBadge}>50% OFF</span>
            <span className={styles.upsellTitle}>{SLIPMAT.name}</span>
            <span className={styles.upsellPrices}>
              <span className={styles.upsellPriceWas}>{formatPrice(SLIPMAT.originalCents)}</span>
              <span className={styles.upsellPriceNow}>{formatPrice(SLIPMAT.priceCents)}</span>
            </span>
          </span>
        </span>
        <span className={`${styles.upsellCheckbox} ${slipmat ? styles.upsellCheckboxChecked : ''}`} aria-hidden="true" />
      </label>
    </div>
  )

  const subtotalRow = (
    <div className={styles.subtotalRow}>
      <span className={styles.subtotalLabel}>Subtotal:</span>
      <strong className={styles.subtotalPrice}>{formatPrice(subtotal)}</strong>
    </div>
  )

  // ── Flow pieces shared by the desktop inline card + the mobile slide-in panel ──
  const mmTabs = (
    <div className={styles.tabs} role="tablist">
      <button
        type="button" role="tab" aria-selected={tab === 'personalize'}
        className={`${styles.tab} ${tab === 'personalize' ? styles.tabActive : ''}`}
        onClick={() => setTab('personalize')}
      >
        <span className={styles.tabStep}>1</span>
        <span className={styles.tabTitle}>Personalize</span>
        <span className={styles.tabSub}>Song, names &amp; date</span>
      </button>
      <button
        type="button" role="tab" aria-selected={tab === 'customize'}
        className={`${styles.tab} ${tab === 'customize' ? styles.tabActive : ''}`}
        onClick={() => setTab('customize')}
      >
        <span className={styles.tabStep}>2</span>
        <span className={styles.tabTitle}>Frame Options</span>
        <span className={styles.tabSub}>Size, color &amp; material</span>
      </button>
    </div>
  )

  // Song title drives the record's center title. (Song combo hidden for now — no lyrics API.)
  const songTitleField = (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="mm-song-title">Pick your song</label>
      <input type="text" id="mm-song-title" className={styles.input} placeholder="e.g. Yellow"
        value={songTitle} onChange={e => setSongTitle(e.target.value)} />
    </div>
  )

  const artistField = (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="mm-artist">Name the artist</label>
      <input type="text" id="mm-artist" className={styles.input} placeholder="e.g. Coldplay"
        value={artist} onChange={e => setArtist(e.target.value)} />
    </div>
  )

  const centerColorField = (
    <div className={styles.field}>
      <span className={styles.label}>
        Color of the center — <span className={styles.labelValue}>{CENTER_COLORS.find(c => c.value === centerColor)?.label}</span>{' '}
        {centerColor === 'purple' && <span className={styles.labelHint}>(Most Popular)</span>}
      </span>
      <div className={styles.swatches} role="group" aria-label="Center color">
        {CENTER_COLORS.map(c => (
          <button key={c.value} type="button" aria-label={c.label}
            className={`${styles.swatch} ${centerColor === c.value ? styles.swatchSelected : ''}`}
            style={{ ['--swatch-color' as string]: c.hex }} onClick={() => setCenterColor(c.value)} />
        ))}
      </div>
    </div>
  )

  const mmPersonalizeInner = (
    <>
      {songTitleField}
      {artistField}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="mm-memory">What&apos;s the occasion?</label>
        <input type="text" id="mm-memory" className={styles.input} placeholder="e.g. Our Wedding Song"
          value={memory} onChange={e => setMemory(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="mm-names">Add Names or special date</label>
        <input type="text" id="mm-names" className={styles.input} placeholder="e.g. Alex & Max, 10.10.2021"
          value={names} onChange={e => setNames(e.target.value)} />
      </div>
      {centerColorField}
    </>
  )

  const mmCustomizeInner = (
    <>
      <div className={styles.frameDropdown}>
        <span className={styles.label}>Material</span>
        <button type="button" className={styles.frameTrigger} aria-expanded={frameListOpen} aria-haspopup="listbox"
          onClick={() => setFrameListOpen(o => !o)}>
          <span className={styles.frameTriggerInner}>
            <img className={styles.frameThumb} src={FRAME_TYPES.find(f => f.value === frameType)?.thumb} alt="" width={40} height={40} />
            <span className={styles.frameValue}>{FRAME_TYPES.find(f => f.value === frameType)?.label}</span>
          </span>
          <svg width="12" height="6" viewBox="0 0 12 8" aria-hidden="true">
            <path fill="currentColor" d="M1.41 0L6 4.58 10.59 0 12 1.41l-6 6-6-6L1.41 0z" />
          </svg>
        </button>
        {frameListOpen && (
          <ul className={styles.frameList} role="listbox">
            {FRAME_TYPES.map(f => {
              const premium = FRAME_PREMIUM_CENTS[f.value]
              return (
                <li key={f.value} role="option" aria-selected={f.value === frameType}
                  className={`${styles.frameOption} ${f.value === frameType ? styles.frameOptionSelected : ''}`}
                  onClick={() => { setFrameType(f.value); setFrameListOpen(false) }}>
                  <img className={styles.frameThumb} src={f.thumb} alt="" width={40} height={40} />
                  <span className={styles.frameOptionMain}>
                    <span className={styles.frameName}>{f.label}</span>
                    <span className={styles.frameDelta}>{premium === 0 ? 'Included' : `+${formatPrice(premium)}`}</span>
                  </span>
                  <span className={styles.framePrice}>{formatPrice(priceForFrame(f.value, size))}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {isCanvas && (
        <div className={styles.field}>
          <span className={styles.label}>
            Frame color — <span className={styles.labelValue}>{FRAME_COLORS.find(c => c.value === frameColor)?.label}</span>
          </span>
          <div className={styles.swatches} role="group" aria-label="Frame color">
            {FRAME_COLORS.map(c => (
              <button key={c.value} type="button" aria-label={c.label}
                className={`${styles.swatch} ${c.light ? styles.swatchLight : ''} ${frameColor === c.value ? styles.swatchSelected : ''}`}
                style={{ ['--swatch-color' as string]: c.hex }} onClick={() => setFrameColor(c.value)} />
            ))}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Choose size</span>
          <button type="button" className={styles.sizeGuideLink}>Size guide</button>
        </div>
        <select className={styles.select} aria-label="Product size" value={size} onChange={e => setSize(e.target.value)}>
          {SIZE_OPTIONS.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
      </div>
    </>
  )

  const mmActiveInner = tab === 'personalize' ? mmPersonalizeInner : mmCustomizeInner

  const mmFooter = tab === 'personalize' ? (
    <button type="button" className={styles.ctaButton} onClick={() => setTab('customize')}>
      Continue to frame options
    </button>
  ) : (
    <>
      {subtotalRow}
      <button type="button" className={styles.ctaButton} onClick={handleAddToBag} disabled={!songTitle.trim()}>
        Add to bag
      </button>
    </>
  )

  return (
    <section className={pdp.formPanel} aria-label="Product options">
      {/* Offscreen preview instance — the single source for gallery + cart images */}
      <div className={styles.serializerHost} ref={serializerRef} aria-hidden="true">
        <VinylPreviewSvg
          idSuffix="ser"
          songTitle={songTitle}
          memory={memory}
          names={names}
          centerHex={centerHex}
        />
      </div>

      {/* Header — mirrors LalCanvasCustomizer */}
      <div className={pdp.productHeader}>
        <nav className={pdp.breadcrumb} aria-label="Breadcrumb">
          <ol className={pdp.breadcrumbList}>
            <li><Link href={`/${brand}`} className={pdp.breadcrumbLink}>Home</Link></li>
            <li aria-hidden="true" className={pdp.breadcrumbSep}><ChevronIcon size={20} /></li>
            <li><Link href={`/${brand}/category`} className={pdp.breadcrumbLink}>Best Sellers</Link></li>
          </ol>
        </nav>

        <div className={pdp.productTitlePriceGroup}>
          <h1 className={pdp.productTitle}>{product.name}</h1>
          <div className={pdp.priceRow}>
            <span className={pdp.priceCurrent} style={{ color: 'var(--colors-text)' }}>{formatPrice(currentPrice)}</span>
          </div>
        </div>

        <div className={pdp.ratingRow}>
          <div className={pdp.stars} aria-label={`${LAL_RATING} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={i <= filledStars ? pdp.starFilled : pdp.starEmpty}>
                <StarIcon size={20} />
              </span>
            ))}
          </div>
          <span className={pdp.ratingValue}>{LAL_RATING}</span>
          <a
            href="#reviews"
            className={pdp.ratingCount}
            onClick={e => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
          >{LAL_REVIEW_COUNT} Reviews</a>
        </div>
      </div>

      <div className={styles.customizer}>
        {/* ── Default state: song + artist fields, then Personalize CTA ── */}
        {phase === 'default' && (
          <>
            {songTitleField}
            {artistField}
            <button type="button" className={styles.ctaButton} onClick={() => { setPhase('flow'); setTab('personalize') }}>
              Personalize yours
            </button>
          </>
        )}

        {/* ── Flow state — desktop: inline 2-tab card ── */}
        {phase === 'flow' && !isMobile && (
          <>
            <button type="button" className={styles.flowBack} onClick={() => setPhase('default')}>
              <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true" fill="none">
                <path d="M7 1L2 6l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <div className={styles.flowCard}>
              {mmTabs}
              <div className={styles.panel} role="tabpanel">
                {mmActiveInner}
                {mmFooter}
              </div>
            </div>
          </>
        )}

        {/* ── Saved state: summary + upsell + add to bag ── */}
        {phase === 'saved' && (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryTitle}>My Personalization</span>
                <button type="button" className={styles.summaryEdit} onClick={() => { setPhase('flow'); setTab('personalize') }}>
                  Edit
                </button>
              </div>
              <dl className={styles.summaryList}>
                {[
                  ['Song', songTitle.trim() || '—'],
                  ['Artist', artist.trim() || '—'],
                  ['Memory', memory.trim() || '—'],
                  ['Names/Date', names.trim() || '—'],
                  ['Color', CENTER_COLORS.find(c => c.value === centerColor)?.label ?? '—'],
                  ['Size', SIZE_OPTIONS.find(s => s.value === size)?.label ?? '—'],
                  ['Frame', FRAME_TYPES.find(f => f.value === frameType)?.label ?? '—'],
                  ...(isCanvas ? [['Frame color', FRAME_COLORS.find(c => c.value === frameColor)?.label ?? '—']] : []),
                ].map(([term, value]) => (
                  <div key={term} className={styles.summaryRow}>
                    <dt className={styles.summaryTerm}>{term}</dt>
                    <dd className={styles.summaryValue}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {/* Limited time offer — hidden for now */}
            {/* {upsellCard('saved')} */}
            <button type="button" className={styles.ctaButton} onClick={handleAddToBag}>
              Add to bag
            </button>
          </>
        )}
      </div>

      {/* Trust badges */}
      <ul className={styles.trustBadges} aria-label="Trust badges">
        {[
          { Icon: RevisionsGlyph, text: 'Free Unlimited Revisions' },
          { Icon: PersonIcon,     text: 'Made by real artists' },
          { Icon: ShippingIcon,   text: 'Free Shipping On All Orders' },
          { Icon: MapPinIcon,     text: 'American-Made' },
        ].map(({ Icon, text }) => (
          <li key={text} className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">{Icon ? <Icon size={24} /> : null}</span>
            <span className={styles.trustText}>{text}</span>
          </li>
        ))}
      </ul>

      {/* ── Flow state — mobile: shared slide-in panel ── */}
      {isMobile && (
        <CustomizerPanel
          open={phase === 'flow'}
          onClose={() => setPhase('default')}
          ariaLabel="Personalize your canvas"
          closeIcon={XIcon ? <XIcon size={20} /> : undefined}
          scrollResetKey={tab}
          preview={previewImage
            ? <img src={previewImage} alt="" className={styles.panelPreviewImg} />
            : <div className={styles.panelPreviewPlaceholder} aria-hidden="true" />}
        >
          {mmTabs}
          {/* CTA flows inline below the last field (not a sticky footer) */}
          <div className={styles.panel} role="tabpanel">{mmActiveInner}{mmFooter}</div>
        </CustomizerPanel>
      )}
    </section>
  )
}
