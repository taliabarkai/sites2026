'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import Link from 'next/link'
import type { CartItem } from '../_context/CartContext'
import type { ProductItem } from '../../../data/products'
import { Button } from '../_components/Button'
import { CustomizerPanel, useIsMobile } from '../_components/CustomizerPanel'
import { ProductOptions, useProductOptions } from '../_components/ProductOptions'
import type { ProductOptionsController } from '../_components/ProductOptions'
import { StickyCustomizeBar } from '../_components/StickyCustomizeBar'
import { useNestedItems } from '../_components/NestedItems/useNestedItems'
import { SECOND_ITEM_TITLE, secondItemOffer, secondItemPreviewInput } from './_templates/secondItem'
import type { PersonalizePlacement } from '../_config/demoParams'
import { materialLabel } from '../_config/brands'
import { fieldById, stepFields, type Field, type FieldDisplayType, type PdpTemplate, type PresentationStep } from './_templates'
import {
  allGroups, cartOptions, derivedText, groupId, groupsForField, isVisible, offeredValues, missingRequired, parsePriceLabel, previewInput, previewKey, summaryLines, templatePrice, textValues,
} from './_templates/fieldState'
import { blankPreview, debounceFor, isRemote, readPreviewColors, renderPreview } from './_templates/previewEngine'
import pdp from './ProductDetailPage.module.css'
// The subtotal row matches Music Memories', so it reuses MM's styles
import mm from './MusicMemoriesCustomizer.module.css'
import styles from './TemplateCustomizer.module.css'

type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

interface TemplateCustomizerIcons {
  AiMagicIcon: IconCmp
  ArrowIcon: IconCmp
  CheckmarkIcon: IconCmp
  ChevronIcon: IconCmp
  StarIcon: IconCmp
  XIcon: IconCmp
  TooltipIcon: IconCmp
}

export interface TemplateCustomizerProps {
  brand: string
  template: PdpTemplate
  product: ProductItem
  icons: TemplateCustomizerIcons
  addItem: (item: CartItem) => void
  openCart: (added?: boolean) => void
  /** The composited preview, for the gallery (null clears it). */
  onLivePreviewChange: (image: string | null) => void
  /** True while an engine render is in flight (external engine). */
  onLivePreviewLoadingChange: (loading: boolean) => void
  /** True once the preview shows the shopper's own text rather than the template's sample. */
  onPersonalizedChange?: (personalized: boolean) => void
  /** Drawn right under the page's main CTA — Personalize or Add to Bag (the USPs). */
  belowCta?: React.ReactNode
  /**
   * Demo override: `page` puts every field on the page; `panel` puts the
   * personalization behind a "Personalize" row that opens the panel (a bottom
   * sheet on mobile, a drawer from the right on desktop). `panel-v3` keeps
   * every field on the page, and on mobile tapping a name field opens the
   * panel with that field already focused. Unset: the template's own.
   */
  placement?: PersonalizePlacement
  /** V1: the shopper saved their personalization (the page brings the gallery into view). */
  onSaved?: () => void
  /** Demo: the material picker as image-only carousel tiles instead of the standard carousel. */
  materialImageOnly?: boolean
  /** Demo: offer a second of this product at 50% off, just above Add to Bag. */
  nestedOffer?: boolean
  /** True while the "Added to your bag" state stands in for the form. */
  onAddedChange?: (added: boolean) => void
  /** "Personalize Another": the page starts the customizer over from scratch. */
  onPersonalizeAnother?: () => void
  /** When set, the header (breadcrumbs, title, price, reviews) is drawn here instead — above the gallery (V2). */
  headerSlot?: HTMLElement | null
}

/** V5, OAL: the diamond accent's price, in cents (placeholder until the catalog carries it). */
const DIAMOND_ACCENT_CENTS = 4000

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

// ─── Preview note — shared by the gallery slot and the mobile panel ─────────

/** "Preview is approximate", and an updating state while the engine renders. */
export function LivePreviewNote({ disclaimer, loading }: { disclaimer?: string; loading?: boolean }) {
  if (!disclaimer && !loading) return null
  return (
    <>
      {loading && (
        <span className={styles.previewLoading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          Updating preview…
        </span>
      )}
      {disclaimer && <span className={styles.previewDisclaimer}>{disclaimer}</span>}
    </>
  )
}

// ─── Field decorations ──────────────────────────────────────────────────────

function FieldTooltip({ text, Icon }: { text: string; Icon: IconCmp }) {
  const [open, setOpen] = useState(false)
  return (
    <span className={styles.tooltipWrap}>
      <button
        type="button"
        className={styles.tooltipButton}
        aria-label="More information"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        <Icon size={16} />
      </button>
      {open && <span role="tooltip" className={styles.tooltip}>{text}</span>}
    </span>
  )
}

// ─── Customizer ─────────────────────────────────────────────────────────────

/**
 * Renders any PDP template: one component for single-step and multi-step
 * pages. `flow.container` decides where the steps live — on the page
 * (`inline`), as tabs in a card (`card`), or in the slide-in CustomizerPanel
 * (`panel`, mobile). Fields render through ProductOptions; the price and the
 * live preview read back from the same option state.
 */
export function TemplateCustomizer({
  brand, template, product, icons, addItem, openCart, onLivePreviewChange, onLivePreviewLoadingChange, onPersonalizedChange, belowCta, placement, headerSlot, onSaved, onAddedChange, onPersonalizeAnother, nestedOffer, materialImageOnly,
}: TemplateCustomizerProps) {
  const { AiMagicIcon, ArrowIcon, CheckmarkIcon, ChevronIcon, StarIcon, XIcon, TooltipIcon } = icons
  const isMobile = useIsMobile()
  const rootRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // ── Option state: every group the template could show, seeded once ─────────
  const groups = useMemo(() => allGroups(template), [template])
  const base = useProductOptions(groups, 0)
  const { state } = base
  // A choice that's no longer offered (1 initial once a stone is picked) moves to the first that is
  const offerKey = template.fields.map((f) => offeredValues(f, state).map((v) => v.id).join(',')).join('|')
  const chooseBase = base.choose
  useEffect(() => {
    for (const f of template.fields) {
      if (!f.values?.some((v) => v.visibleWhen)) continue
      const offered = offeredValues(f, state)
      const picked = state.choices[groupId(f.fieldId)]
      if (offered.length && !offered.some((v) => v.id === picked)) chooseBase(groupId(f.fieldId), offered[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a change in what's offered drives it
  }, [offerKey])
  const [errors, setErrors] = useState<string[]>([])
  // The preview starts with the shopper's first selection and stays from then
  // on — on a stepped page, once they open the steps (as MM does): picking a
  // material on the page beforehand only moves the price. Until then the
  // gallery leads with the product's own first image.
  const [started, setStarted] = useState(false)
  const [entered, setEntered] = useState(false)
  // Typing into a field clears its error
  const options: ProductOptionsController = {
    ...base,
    choose: (id, valueId) => { base.choose(id, valueId); if (entered || inline) setStarted(true) },
    setText: (id, value) => {
      base.setText(id, value)
      if (value.trim()) setStarted(true)
      setErrors((e) => (e.includes(id) ? e.filter((x) => x !== id) : e))
    },
  }

  // A product-wide sale: what's charged is the material's price less the sale
  const salePercent = template.sale?.percent ?? 0
  const onSale = (cents: number) => Math.round(cents * (1 - salePercent / 100))
  const fullPrice = templatePrice(template, state, product.priceInCents ?? 0)
  const price = salePercent ? onSale(fullPrice) : fullPrice

  // ── V5, OAL only: an optional diamond accent ──
  const [diamondAccent, setDiamondAccent] = useState(false)
  // …unless the product asks for its stones itself (Inez)
  const accentOffered = placement === 'jewelry' && brand === 'oal' && !template.fields.some((f) => /stone|diamond/i.test(f.cartName))

  // ── Nested item (demo toggle): a second necklace at 50% off, above Add to Bag ──
  // Its panel's image becomes the necklace with the name typed there, in its material
  const [secondChoices, setSecondChoices] = useState<Record<string, string> | null>(null)
  const [secondPreview, setSecondPreview] = useState<string | null>(null)
  const offer = useMemo(() => (nestedOffer ? secondItemOffer(template, product, secondPreview) : null), [nestedOffer, template, product, secondPreview])
  const nested = useNestedItems(brand, offer ? [offer] : [], SECOND_ITEM_TITLE, {
    onPanelChange: (_item, values) => setSecondChoices(values.selectedOptions),
    // Unchecked: back to the product photo, the typed name forgotten
    onUnstage: () => { setSecondChoices(null); setSecondPreview(null) },
  })
  // Turning the offer off drops a second necklace already picked, and its preview
  const clearNested = nested.clear
  useEffect(() => {
    if (nestedOffer) return
    clearNested()
    setSecondChoices(null)
    setSecondPreview(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the toggle drives it
  }, [nestedOffer])
  const secondKey = secondChoices ? JSON.stringify(secondItemPreviewInput(template, secondChoices)) : ''
  useEffect(() => {
    if (!secondKey) return
    const input = JSON.parse(secondKey) as { choices: Record<number, string>; texts: Record<number, string[]> }
    if (!Object.values(input.texts).some((t) => t.some((v) => v.trim()))) { setSecondPreview(null); return }
    let live = true
    const timer = setTimeout(() => {
      renderPreview(template, template.livePreview.engine, input, readPreviewColors(rootRef.current))
        .then((img) => { if (live && img) setSecondPreview(img) })
        .catch(() => {})
    }, debounceFor(template.livePreview.engine))
    return () => { live = false; clearTimeout(timer) }
  }, [secondKey, template])

  // ── Flow ────────────────────────────────────────────────────────────────────
  const { flow, livePreview } = template
  // The Personalize toggle: "panel" puts the personalization behind a row that
  // opens the panel at every width; "page" puts every field on the page
  // V1 and V4 put the personalization behind the panel
  const rowMode = placement === 'panel' || placement === 'panel-c'
  // V4: no Save step — the page's one CTA opens the panel, and the panel adds to bag
  const buyInPanel = placement === 'panel-c'
  // V5 (Jewelry): Music Memories' two-step flow — Personalize, then Customize
  // and Add to bag — in a sheet on mobile, inline tabs on desktop
  const jewelry = placement === 'jewelry'
  // v3: the page as "On page"; on mobile, typing happens in the panel
  const tapPanel = placement === 'panel-v3'
  const tapMode = tapPanel && isMobile
  // V1 / V4 on desktop start as on mobile (the Personalize row, Personalize
  // Now); opening them swaps that for the fields inline — no sheet, no Save —
  // with the preview live in the gallery beside them
  const container = rowMode ? 'panel' : jewelry ? (isMobile ? 'panel' : 'card') : placement === 'page' || tapPanel ? 'inline' : flow.container[isMobile ? 'mobile' : 'desktop']
  const inline = container === 'inline'
  // The panel is a mobile sheet; on desktop a template's own `panel` container draws as a card
  const usePanel = container === 'panel' && isMobile
  const [stepIdx, setStepIdx] = useState(0)
  // Entry fields sit on the page before the steps open. One that a step also
  // holds (TGR's material) is the same state in both places, so they stay in sync.
  // A page moved into the panel by the toggle keeps its price-setting fields
  // (the material) on the page, unless the template names its own.
  // V5: the material on the page, above the Personalize yours card (and out of Customize)
  const entryIdList = jewelry ? template.fields.filter((f) => f.pricing === 'base').map((f) => f.fieldId) : (rowMode || tapMode) && !flow.entryFieldIds
    ? template.fields.filter((f) => f.pricing === 'base').map((f) => f.fieldId)
    : flow.entryFieldIds ?? []
  const entryFields = inline ? [] : entryIdList.map((id) => fieldById(template, id)).filter((f): f is Field => !!f)
  // …and its panel holds only the rest: the personalization fields
  // V5's two steps: the name (and a count that repeats it), then everything else
  const jewelrySteps = useMemo(() => {
    const byOrder = [...template.fields].sort((a, b) => a.order - b.order)
    const countIds = new Set(byOrder.filter((f) => f.repeat).map((f) => f.repeat!.countFieldId))
    // …and whatever decides which counts are offered (Inez: a stone means 2+ initials), ahead of it
    const gateIds = new Set(
      byOrder.filter((f) => countIds.has(f.fieldId)).flatMap((f) => (f.values ?? []).flatMap((v) => {
        const w = v.visibleWhen
        return w ? (Array.isArray(w) ? w : [w]).map((c) => c.fieldId) : []
      })),
    )
    const first = byOrder.filter((f) => f.type === 'text' || countIds.has(f.fieldId) || gateIds.has(f.fieldId)).map((f) => f.fieldId)
    const rest = byOrder.filter((f) => !first.includes(f.fieldId)).map((f) => f.fieldId)
    const two: PresentationStep[] = [{ label: 'Personalize', fieldIds: first }, { label: 'Customize', fieldIds: rest }]
    return two
  }, [template])
  const steps = (jewelry ? jewelrySteps : template.steps)
    .map((s) => ((rowMode || jewelry) && !inline ? { ...s, fieldIds: s.fieldIds.filter((id) => !entryIdList.includes(id)) } : s))
    .filter((s) => s.fieldIds.length > 0)
  // v3's panel: only the text (the name), with Save
  const tapFields = tapMode
    ? template.steps.flatMap((s) => stepFields(template, s)).filter((f) => f.type === 'text' && !entryIdList.includes(f.fieldId))
    : []
  const tapPanelRef = useRef<HTMLDivElement>(null)
  /**
   * v3: a tap on a text field on the page opens the panel and moves the focus
   * to the same input there — synchronously, inside the tap, so the phone's
   * keyboard stays up and the shopper keeps typing without a second tap.
   */
  const handlePageFocus = (e: React.FocusEvent<HTMLElement>) => {
    // Once saved, the page's field is a plain field; the Preview button opens the panel
    if (!tapMode || entered || saved) return
    const input = e.target
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return
    const fieldEl = input.closest<HTMLElement>('[data-field-id]')
    const field = fieldEl && fieldById(template, Number(fieldEl.dataset.fieldId))
    if (!fieldEl || field?.type !== 'text') return
    const index = Array.from(fieldEl.querySelectorAll('input, textarea')).indexOf(input)
    flushSync(() => { setEntered(true); setStarted(true) })
    const target = tapPanelRef.current
      ?.querySelector(`[data-field-id="${field.fieldId}"]`)
      ?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')[index]
    if (!target) return
    target.focus({ preventScroll: true })
    const end = target.value.length
    target.setSelectionRange(end, end)
  }
  const entryCta = flow.entryCta ?? 'Personalize'
  // "In panel" with a single step: the compact sheet (as v3's) — preview, fields, Save
  const compactPanel = rowMode && steps.length === 1
  const rowCopy = flow.personalizeRow ?? { title: 'Personalize Yours', description: 'See your name in our signature script' }
  const lastStep = stepIdx === steps.length - 1
  const inSomeStep = (f: Field) => steps.some((s) => s.fieldIds.includes(f.fieldId))
  // While the desktop card is open it shows those shared fields itself
  const cardOpen = entered && !usePanel && !inline
  const pageEntryFields = cardOpen ? entryFields.filter((f) => !inSomeStep(f)) : entryFields
  const hidesEntryFields = cardOpen && pageEntryFields.length < entryFields.length

  // Desktop V1 / V4: the opened section animates open from the button and
  // back down to it; the button fades back in after a close
  const inlineOpenRef = useRef<HTMLDivElement>(null)
  const [closingInline, setClosingInline] = useState(false)
  const [returnedToCta, setReturnedToCta] = useState(false)
  useLayoutEffect(() => {
    // The open animation runs to the section's real height, so its pace is even
    const el = inlineOpenRef.current
    if (cardOpen && el) el.style.setProperty('--open-h', `${el.scrollHeight}px`)
  }, [cardOpen])

  // Opens on step 1 the first time; reopening resumes where the shopper was
  const enter = () => { setEntered(true); setStarted(true) }

  // "From $X" until the steps open, when a later choice can still add to the price
  const entryIds = new Set(entryFields.map((f) => f.fieldId))
  const canAddCost = template.fields.some((f) => !entryIds.has(f.fieldId) && f.values?.some((v) => (v.priceDelta ?? 0) > 0))
  const shownFull = fullPrice
  const pricePrefix = !inline && !started && canAddCost ? 'From ' : ''
  const priceLabel = `${pricePrefix}${formatPrice(salePercent ? onSale(shownFull) : shownFull)}`

  // ── Live preview ────────────────────────────────────────────────────────────
  const shopperInput = previewInput(template, state)
  const hasTextFields = template.fields.some((f) => f.type === 'text' && f.affectsPreview !== false)
  const hasText = Object.values(shopperInput.texts).some((values) => values.some((t) => t.trim()))
  const sample = livePreview.sampleText
  // With a sample, the preview is the main image from page load and draws the
  // sample until the shopper types (and again if they clear it). Without one,
  // it shows only once there's text: clearing hands the slot back to the photo.
  const input = sample && !hasText
    ? {
        ...shopperInput,
        texts: Object.fromEntries(
          Object.entries(shopperInput.texts).map(([id, values]) => {
            const names = sample[Number(id)] ?? []
            return [id, names.length ? values.map((_, i) => names[i % names.length]) : values]
          }),
        ),
      }
    : shopperInput
  const inputKey = previewKey(input)
  const previewOn = livePreview.enabled && (sample ? true : started && (!hasTextFields || hasText))
  // The badge goes up once the preview shows the shopper's own text
  // ── Behind the row: the personalization counts once saved ──────────────────
  const [saved, setSaved] = useState(false)
  const panelFields = tapMode ? tapFields : steps.flatMap((s) => stepFields(template, s))
  const isSaved = (rowMode || tapMode) && saved && missingRequired(template, panelFields, state).length === 0
  // What the saved row shows: each answer in the panel — "Your name  Talia", "Chain length  16""
  // …shown as the bag card shows it: the name in quotes, then the other
  // choices (the chain; the material is on the page already)
  const savedName = panelFields
    .filter((f) => f.type === 'text' && isVisible(f, state))
    .flatMap((f) => textValues(template, f, state))
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `“${t}”`)
    .join(', ')
  const savedDetails = summaryLines(template, panelFields.filter((f) => f.type !== 'text'), state).map((l) => l.value).join(' · ')
  // The gallery and badge follow the shopper's text — or, behind the row, the save
  // V1/V3: while the panel is open the gallery behind it keeps the saved
  // necklace — the panel's own preview follows the typing, the gallery (and
  // its badge) take the new one when the panel closes (Save)
  const galleryFrozen = (rowMode || tapMode || jewelry) && entered && isMobile
  useEffect(() => {
    if (galleryFrozen) return
    // V4 has no Save: the shopper's own name counts as soon as the panel closes on it
    // Desktop, while the card is open: the gallery beside it is the preview, so it follows the typing
    const live = buyInPanel || !isMobile || !(rowMode || tapMode)
    onPersonalizedChange?.(live ? hasText : isSaved)
  }, [rowMode, tapMode, buyInPanel, isMobile, entered, isSaved, hasText, onPersonalizedChange, galleryFrozen])
  const engine = livePreview.engine

  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const previewRef = useRef<string | null>(null)
  const requestRef = useRef(0)
  const galleryFrozenRef = useRef(galleryFrozen)
  galleryFrozenRef.current = galleryFrozen
  useEffect(() => {
    if (!galleryFrozen) onLivePreviewChange(previewRef.current)
  }, [galleryFrozen, onLivePreviewChange])

  useEffect(() => {
    const publish = (img: string | null) => {
      previewRef.current = img
      setPreview(img)
      if (!galleryFrozenRef.current || img === null) onLivePreviewChange(img)
    }
    const setBusy = (busy: boolean) => { setLoading(busy); onLivePreviewLoadingChange(busy) }

    if (!previewOn) { publish(null); setBusy(false); return }

    const id = ++requestRef.current
    const colors = readPreviewColors(rootRef.current)
    if (isRemote(engine)) {
      // The studio renders fast enough to swap in place: no "Updating preview"
      // loader for it — only the simulated external engine shows one
      if (engine.kind === 'external') setBusy(true)
      // First request: hold the gallery slot with a blank frame
      if (!previewRef.current) publish(blankPreview(colors))
    }
    const timer = setTimeout(() => {
      renderPreview(template, engine, JSON.parse(inputKey), colors)
        .then((img) => {
          if (id !== requestRef.current) return // a newer request superseded this one
          if (img) publish(img)
          setBusy(false)
        })
        .catch(() => { if (id === requestRef.current) setBusy(false) })
    }, debounceFor(engine))
    return () => clearTimeout(timer)
  }, [previewOn, inputKey, engine, template, onLivePreviewChange, onLivePreviewLoadingChange])

  // Leaving the page clears the gallery slot
  useEffect(() => () => { onLivePreviewChange(null); onLivePreviewLoadingChange(false) }, [onLivePreviewChange, onLivePreviewLoadingChange])

  // ── Validation + add to bag ─────────────────────────────────────────────────
  /** Flags empty required inputs in the given steps; returns the first step that has one. */
  const validate = (stepIndexes: number[]): number | null => {
    const missing = stepIndexes.flatMap((i) => missingRequired(template, stepFields(template, steps[i]), state))
    setErrors(missing)
    if (missing.length === 0) return null
    return stepIndexes.find((i) => missingRequired(template, stepFields(template, steps[i]), state).length > 0) ?? null
  }

  const handleNext = () => {
    if (validate([stepIdx]) !== null) return
    setStepIdx((i) => Math.min(steps.length - 1, i + 1))
  }

  /** Behind the row: checks the panel's fields, keeps them, closes the panel. */
  const handleSave = () => {
    const bad = validate(steps.map((_, i) => i))
    if (bad !== null) { setStepIdx(bad); return }
    setSaved(true)
    setEntered(false)
    onSaved?.()
  }

  /** v3: checks the name, keeps it, closes the panel — the gallery then leads with the preview. */
  // v3: the name as last saved — editing it on the page afterwards is what brings Preview up
  const tapTextKey = JSON.stringify(tapFields.map((f) => textValues(template, f, state).map((t) => t.trim())))
  const [savedTextKey, setSavedTextKey] = useState<string | null>(null)
  const handleSaveName = () => {
    const missing = missingRequired(template, tapFields, state)
    setErrors(missing)
    if (missing.length > 0) return
    setSaved(true)
    setSavedTextKey(tapTextKey)
    setEntered(false)
  }

  /** Desktop V1 / V4: closing the inline fields keeps them — V1 shows them as saved. */
  const finishCloseInline = () => {
    if (rowMode && !buyInPanel && missingRequired(template, panelFields, state).length === 0) setSaved(true)
    setClosingInline(false)
    setEntered(false)
    setReturnedToCta(true)
  }
  /** Desktop: the opened section folds back down to the button's height, then the button returns */
  const closeInline = () => {
    const el = inlineOpenRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finishCloseInline(); return }
    el.style.setProperty('--open-h', `${el.scrollHeight}px`)
    setClosingInline(true)
  }

  const handleAddToBag = () => {
    const bad = validate(steps.map((_, i) => i))
    if (bad !== null) {
      setStepIdx(bad)
      if (!inline) setEntered(true)
      return
    }
    const accent = accentOffered && diamondAccent
    const selectedOptions = [...cartOptions(template, state), ...(accent ? [{ label: 'Diamond accent', value: 'Yes' }] : [])]
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: price + (accent ? DIAMOND_ACCENT_CENTS : 0),
      originalPrice: salePercent ? fullPrice + (accent ? DIAMOND_ACCENT_CENTS : 0) : undefined,
      image: (!loading && preview) || product.image,
      isPersonalized: Object.values(state.text).some((t) => t.trim()),
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions,
    })
    // The nested item, staged in its Quick Add panel, goes in with it
    nested.stagedItems.forEach((it) => addItem(it))
    nested.clear()
    setEntered(false)
    // As Music Memories: the form gives way to "Added to your bag" and Personalize Another
    const texts = template.fields
      .filter((f) => f.type === 'text' && isVisible(f, state))
      .flatMap((f) => textValues(template, f, state))
      .map((t) => t.trim())
      .filter(Boolean)
    const textLabels = new Set(template.fields.filter((f) => f.type === 'text').map((f) => f.cartName))
    setAddedItem({
      image: (!loading && preview) || product.image,
      title: texts.length ? texts.map((t) => `“${t}”`).join(', ') : product.name,
      subtitle: selectedOptions
        .filter((o) => !textLabels.has(o.label.replace(/ \d+$/, '')))
        .map((o) => o.value)
        .join(' · '),
      rows: selectedOptions.map((o) => ({ k: o.label, v: o.value })),
    })
    setAddedOpen(false)
    openCart(true)
  }

  // ── Added to your bag (as Music Memories) ───────────────────────────────────
  const [addedItem, setAddedItem] = useState<{ image: string; title: string; subtitle: string; rows: { k: string; v: string }[] } | null>(null)
  const [addedOpen, setAddedOpen] = useState(false)
  useEffect(() => { onAddedChange?.(!!addedItem) }, [addedItem, onAddedChange])
  useEffect(() => () => onAddedChange?.(false), [onAddedChange])
  /** Edit: back to the form with this design's answers (behind the row: the panel opens). */
  const editAdded = () => {
    setAddedItem(null)
    if (rowMode || container === 'panel') enter()
  }

  // ── Rendering ───────────────────────────────────────────────────────────────
  // v3: right after saving there's nothing new to preview. Once the shopper
  // edits the saved name on the page, a Preview button beside it opens the
  // panel again (saving there hides it). Clearing the name hides it too.
  const previewButtonFor = (field: Field) => tapMode && isSaved && tapTextKey !== savedTextKey && tapFields.includes(field)

  const renderField = (fieldIn: Field, displayType?: FieldDisplayType, opts?: { inPanel?: boolean }) => {
    let field = fieldIn
    if (!isVisible(field, state)) return null
    // No help link in a panel or on v3's name; Preview only on the page
    const showHelpLink = !!field.helpLink && !opts?.inPanel && !(tapMode && tapFields.includes(field))
    const showPreview = previewButtonFor(field) && !opts?.inPanel
    // The name on a v3 page keeps one wrapper whether or not Preview shows,
    // so the input never remounts (and the keyboard stays up) as it comes and goes
    const previewSlot = tapMode && tapFields.includes(field) && !opts?.inPanel

    if (field.derivedFrom) {
      return (
        <div key={field.fieldId} className={styles.derived}>
          <p className={styles.derivedLabel}>{field.name}</p>
          <p className={styles.derivedValue}>{derivedText(template, field, state)}</p>
        </div>
      )
    }

    // V5's copy: "Material: Gold Vermeil" for the material, a helper under the name
    // (The image-only tiles name the picked one beside the label themselves: "Material — Gold Vermeil")
    if (jewelry && field.pricing === 'base') {
      const picked = summaryLines(template, [field], state)[0]?.value
      field = { ...field, name: picked && !materialImageOnly ? `${materialLabel(brand)}: ${picked}` : materialLabel(brand) }
    }
    if (jewelry && field.type === 'text' && !field.note && field.textMaxLength && !field.keyboard) {
      field = { ...field, note: { text: `Letters only, up to ${field.textMaxLength} characters` } }
    }
    // Demo toggle: the material as the carousel's standard image-only tiles
    const fieldGroups = groupsForField(template, field, state, displayType).map((g) =>
      materialImageOnly && field.pricing === 'base' && g.kind === 'choice'
        ? { ...g, display: 'carousel' as const, tile: 'image-only' as const, size: 'sm' as const, priceBelow: true }
        : g,
    )
    const slots = Object.fromEntries(
      fieldGroups.filter((g) => errors.includes(g.id)).map((g) => [g.id, <p key="err" className={styles.error} role="alert">Please fill in {g.label.toLowerCase()}</p>]),
    )
    return (
      <div key={field.fieldId} className={styles.field} data-field-id={field.fieldId}>
        {(showHelpLink || field.tooltip) && (
          <div className={styles.fieldAside}>
            {field.tooltip && <FieldTooltip text={field.tooltip} Icon={TooltipIcon} />}
            {showHelpLink && (
              <a href="#" className={styles.helpLink} onClick={(e) => e.preventDefault()}>{field.helpLink}</a>
            )}
          </div>
        )}
        {previewSlot ? (
          <div className={styles.previewRow}>
            <div className={styles.previewRowField}>
              <ProductOptions groups={fieldGroups} options={options} basePrice={price} slots={slots} />
            </div>
            {showPreview && (
              <Button variant="secondary" className={styles.previewButton} onClick={() => setEntered(true)} aria-haspopup="dialog">Preview</Button>
            )}
          </div>
        ) : (
          <ProductOptions groups={fieldGroups} options={options} basePrice={price} slots={slots} />
        )}
        {field.note && (
          <p className={`${styles.note} ${field.note.tone === 'warning' ? styles.noteWarning : ''}`}>{field.note.text}</p>
        )}
      </div>
    )
  }

  const renderStep = (i: number) => (
    <div className={styles.stepFields}>
      {stepFields(template, steps[i]).map((f) => renderField(f, steps[i].display?.[f.fieldId]))}
      {/* V5's Customize: the OAL diamond accent, then the upsell (where MM has its slipmat) */}
      {jewelry && i === steps.length - 1 && accentOffered && (
        <label className={styles.accentRow}>
          <input type="checkbox" checked={diamondAccent} onChange={(e) => setDiamondAccent(e.target.checked)} />
          <span className={styles.accentLabel}>Add a diamond accent</span>
          <span className={styles.accentPrice}>+{formatPrice(DIAMOND_ACCENT_CENTS)}</span>
        </label>
      )}
      {jewelry && i === steps.length - 1 && nested.ui}
    </div>
  )

  const personalizeNowLabel = hasText ? 'Continue Personalizing' : 'Personalize Now'
  const nextLabel = (flow.nextCta ?? 'Continue to {next}').replace('{next}', steps[stepIdx + 1]?.label ?? '')
  const addLabel = `Add to Bag – ${formatPrice(price + nested.nestedTotal)}`
  // V5: "Add to bag · $199", with its add-ons in the total
  const jewelryTotal = price + nested.nestedTotal + (diamondAccent ? DIAMOND_ACCENT_CENTS : 0)

  // Last step: MM's subtotal row above a plain Add to Bag — or, behind the
  // row, Save (Add to Bag stays on the page)
  const stepCta = jewelry ? (
    lastStep ? (
      /* Back to step 1 (a square arrow), then Add to bag with the running total */
      <div className={styles.jewelryFooter}>
        <button type="button" className={styles.stepBackSquare} onClick={() => setStepIdx(0)} aria-label="Back to Personalize">
          <span className={styles.stepBackIcon} aria-hidden="true"><ArrowIcon size={24} /></span>
        </button>
        <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>Add to bag · {formatPrice(jewelryTotal)}</Button>
      </div>
    ) : (
      <Button variant="primary" className={styles.cta} onClick={handleNext}>Next: {steps[stepIdx + 1]?.label}</Button>
    )
  ) : lastStep && buyInPanel ? (
    <>
      {nested.ui}
      <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>{addLabel}</Button>
    </>
  ) : lastStep && rowMode ? (
    <Button variant="primary" className={styles.cta} onClick={handleSave}>Save</Button>
  ) : lastStep ? (
    <div className={styles.finalCta}>
      {nested.ui}
      <div className={mm.subtotalRow}>
        <span className={mm.subtotalLabel}>Subtotal:</span>
        <strong className={mm.subtotalPrice}>{formatPrice(price)}</strong>
      </div>
      <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>Add to Bag</Button>
    </div>
  ) : <Button variant="primary" className={styles.cta} onClick={handleNext}>{nextLabel}</Button>

  // Several steps: numbered tabs. One step: its label and hint as the header.
  const stepHeader = steps.length === 1 ? (
    <div className={styles.stepHeader}>
      <span className={styles.tabTitle}>{steps[0].label}</span>
      {steps[0].hint && <span className={styles.tabSub}>{steps[0].hint}</span>}
    </div>
  ) : steps.length > 1 && (
    <div className={styles.tabs} role="tablist" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {steps.map((s, i) => (
        <button
          key={s.label}
          type="button"
          role="tab"
          aria-selected={i === stepIdx}
          className={`${styles.tab} ${i === stepIdx ? styles.tabActive : ''}`}
          onClick={() => setStepIdx(i)}
        >
          <span className={styles.tabStep}>{i + 1}</span>
          <span className={styles.tabTitle}>{s.label}</span>
          {s.hint && <span className={styles.tabSub}>{s.hint}</span>}
        </button>
      ))}
    </div>
  )

  const rating = product.rating ?? 0

  const header = (
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
            {/* On sale: the full price crossed out, the selling price, "Save N%" */}
            {salePercent > 0 && <span className={pdp.priceOriginal}>{formatPrice(shownFull)}</span>}
            <span className={`${pdp.priceCurrent} ${salePercent > 0 ? pdp.priceOnSale : ''}`} aria-live="polite">{priceLabel}</span>
            {salePercent > 0 && <span className={pdp.priceSave}>Save {salePercent}%</span>}
          </div>
        </div>
        <div className={pdp.ratingRow}>
          <div className={pdp.stars} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={i <= Math.round(rating) ? pdp.starFilled : pdp.starEmpty}><StarIcon size={20} /></span>
            ))}
          </div>
          <span className={pdp.ratingValue}>{rating}</span>
          <a
            href="#reviews"
            className={pdp.ratingCount}
            onClick={(e) => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
          >{(product.reviewCount ?? 0).toLocaleString()} Reviews</a>
        </div>
      </div>
  )

  // Desktop: while the steps are open the column is no longer pinned, so a
  // tall Customize step scrolls with the page instead of running off the window
  return (
    <section ref={rootRef} id="buy-box" className={`${pdp.formPanel} ${cardOpen ? pdp.formPanelUnpinned : ''}`} aria-label="Product options">
      {/* Header — title, live price, rating; above the gallery when given a slot (V2) */}
      {headerSlot ? createPortal(header, headerSlot) : header}

      <div className={`${styles.customizer} ${headerSlot ? styles.customizerHeaderless : ''}`}>
        {addedItem ? (
          /* ── Added to your bag: the design in the bag, then Personalize Another ── */
          <>
            <div className={styles.addedCard}>
              <div className={styles.addedHeader}>
                <span className={styles.addedCheck} aria-hidden="true"><CheckmarkIcon size={14} /></span>
                <span className={styles.addedTitle}>Added to your bag</span>
              </div>
              <button
                type="button"
                className={styles.addedItem}
                onClick={() => setAddedOpen((o) => !o)}
                aria-expanded={addedOpen}
                aria-label="Show design details"
              >
                <span className={styles.addedThumb}><img src={addedItem.image} alt="" /></span>
                <span className={styles.addedText}>
                  <span className={styles.addedName}>{addedItem.title}</span>
                  {addedItem.subtitle && <span className={styles.addedSub}>{addedItem.subtitle}</span>}
                </span>
                <span className={`${styles.addedChevron} ${addedOpen ? styles.addedChevronOpen : ''}`} aria-hidden="true">
                  <ChevronIcon size={20} />
                </span>
              </button>
              {addedOpen && (
                <div className={styles.addedDetails}>
                  <dl className={styles.addedRows}>
                    {addedItem.rows.map((r) => (
                      <div key={r.k} className={styles.addedRow}>
                        <dt className={styles.addedKey}>{r.k}:</dt>
                        <dd className={styles.addedValue}>{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <button type="button" className={styles.addedEdit} onClick={editAdded} aria-label="Edit this design">Edit</button>
                </div>
              )}
            </div>
            <Button variant="add-to-cart" className={styles.cta} onClick={onPersonalizeAnother} leadingIcon={<AiMagicIcon size={24} />}>Personalize Another</Button>
            {belowCta}
          </>
        ) : inline ? (
          /* ── Inline: every step's fields on the page, then Add to Bag ── */
          <>
            {steps.map((s, i) => (
              <div key={s.label} className={styles.inlineStep} onFocus={handlePageFocus}>
                {steps.length > 1 && <h2 className={styles.inlineStepTitle}>{s.label}</h2>}
                {renderStep(i)}
              </div>
            ))}
            {nested.ui}
            {/* data-main-cta: the page's sticky mobile gallery (V2) lets go here */}
            <div ref={ctaRef} data-main-cta="">
              <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>{addLabel}</Button>
            </div>
            {belowCta}
          </>
        ) : (
          /* ── Stepped: entry fields on the page; the CTA opens the steps ── */
          <>
            {hidesEntryFields && (
              /* MM's Back: returns to the page state, input kept */
              <button type="button" className={styles.back} onClick={() => setEntered(false)}>
                <span className={styles.backIcon} aria-hidden="true"><ChevronIcon size={16} /></span>
                Back
              </button>
            )}
            {pageEntryFields.map((f) => renderField(f))}
            {jewelry && !cardOpen ? (
              /* V5: the entry card — no section title; the card or the sticky CTA opens the flow */
              <div ref={ctaRef}>
                <button type="button" className={styles.personalizeRow} onClick={enter} aria-haspopup="dialog">
                  <span className={styles.rowIcon} aria-hidden="true"><AiMagicIcon size={32} /></span>
                  <span className={styles.rowText}>
                    <span className={styles.rowTitle}>Personalize yours</span>
                    <span className={styles.rowSub}>{rowCopy.description}</span>
                  </span>
                  <span className={styles.rowChevron} aria-hidden="true"><ArrowIcon size={24} /></span>
                </button>
              </div>
            ) : rowMode && cardOpen ? (
              /* V1 / V4 on desktop, opened: a card with Back and the fields, then
                 Add to Bag (V1: the page's; V4: its own). It opens out of the
                 button it replaces rather than jumping in */
              <div
                ref={inlineOpenRef}
                className={closingInline ? styles.inlineOpenExit : styles.inlineOpenEnter}
                onAnimationEnd={(e) => { if (closingInline && e.target === e.currentTarget) finishCloseInline() }}
              >
                <div className={styles.rowGroup}>
                <div className={styles.card}>
                  {/* Tabs for several steps; one step gets a title strip with the wand and
                      an X that closes back to the page (V1: "Add Personalization"; V4: its step) */}
                  {steps.length > 1 ? stepHeader : (
                    <div className={`${styles.stepHeader} ${styles.inlineOpenHeader} ${styles.inlineOpenHeaderTinted}`}>
                      <span className={styles.inlineOpenTitle}>
                        <AiMagicIcon size={24} />
                        {buyInPanel ? steps[0].label : 'Add Personalization'}
                      </span>
                      {/* Closes back to the row / Personalize Now, entries kept */}
                      <button type="button" className={styles.inlineOpenClose} onClick={closeInline} aria-label="Close personalization">
                        <XIcon size={20} />
                      </button>
                    </div>
                  )}
                  <div className={`${styles.cardBody} ${styles.inlineOpenBody}`}>
                    {stepFields(template, steps[stepIdx]).map((f) => renderField(f, steps[stepIdx].display?.[f.fieldId], { inPanel: true }))}
                  </div>
                </div>
                </div>
                {!lastStep ? stepCta : buyInPanel ? stepCta : (
                  <>
                    {nested.ui}
                    <div ref={ctaRef}>
                      <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>{addLabel}</Button>
                    </div>
                  </>
                )}
              </div>
            ) : buyInPanel ? (
              /* V4: one CTA — the panel holds the name, the chain and Add to Bag.
                 Closed with a name in it, it picks up where the shopper left off. */
              <>
                <div ref={ctaRef} className={returnedToCta ? styles.ctaReturn : undefined}>
                  <Button variant="add-to-cart" className={styles.cta} onClick={enter} aria-haspopup="dialog" leadingIcon={<AiMagicIcon size={24} />}>{personalizeNowLabel}</Button>
                </div>
              </>
            ) : rowMode ? (
              /* Behind the row: the Personalize row opens the panel; Add to Bag stays here */
              <>
                {/* Titled like the page's other sections ("Select material") */}
                <div className={`${styles.rowGroup} ${returnedToCta ? styles.ctaReturn : ''}`}>
                <p className={styles.rowGroupLabel}>Add Personalization</p>
                <button type="button" className={styles.personalizeRow} onClick={enter} aria-haspopup="dialog">
                  <span className={styles.rowIcon} aria-hidden="true"><AiMagicIcon size={32} /></span>
                  <span className={styles.rowText}>
                    {/* Unsaved: just the description (the section title says "Add Personalization").
                        Saved: as the bag card — the name, then the chain */}
                    {isSaved ? (
                      <>
                        <span className={styles.addedName}>{savedName}</span>
                        {savedDetails && <span className={styles.addedSub}>{savedDetails}</span>}
                      </>
                    ) : (
                      <span className={styles.rowSub}>{rowCopy.description}</span>
                    )}
                  </span>
                  {isSaved
                    ? <span className={styles.rowModify}>Modify</span>
                    : <span className={styles.rowChevron} aria-hidden="true"><ArrowIcon size={24} /></span>}
                </button>
                </div>
                {nested.ui}
                <div ref={ctaRef}>
                  <Button variant="add-to-cart" className={styles.cta} onClick={handleAddToBag}>{addLabel}</Button>
                </div>
              </>
            ) : cardOpen ? (
              /* Card: the CTA gives way to the steps, in a card on the page.
                 V5, as Music Memories: a rule, then Back, above the tabs */
              <>
                {jewelry && (
                  <div className={styles.backRule}>
                    <button type="button" className={styles.back} onClick={() => setEntered(false)}>
                      <span className={styles.backIcon} aria-hidden="true"><ChevronIcon size={16} /></span>
                      Back
                    </button>
                  </div>
                )}
                <div className={styles.card}>
                  {stepHeader}
                  <div className={styles.cardBody} role="tabpanel">
                    {renderStep(stepIdx)}
                    {stepCta}
                  </div>
                </div>
              </>
            ) : (
              <div ref={ctaRef}>
                <Button variant="primary" className={styles.cta} onClick={enter}>{entryCta}</Button>
              </div>
            )}
            {belowCta}
          </>
        )}
      </div>

      {flow.stickyBar && !addedItem && (
        <StickyCustomizeBar
          watch={ctaRef}
          target={rootRef}
          onClick={inline ? undefined : buyInPanel || jewelry ? enter : rowMode ? handleAddToBag : enter}
          label={inline ? undefined : jewelry ? 'Personalize now' : buyInPanel ? personalizeNowLabel : rowMode ? addLabel : entryCta}
        />
      )}

      {/* ── v3 (mobile): the name in a sheet, preview on top, Save — opened by a tap on the name, then by Preview ── */}
      {tapMode && (
        <CustomizerPanel
          open={entered}
          onClose={() => setEntered(false)}
          ariaLabel={rowCopy.title}
          // Hugs the preview, the name and Save — not a full-screen sheet
          fitContent
          previewFullBleed
          closeIcon={<XIcon size={20} />}
          preview={livePreview.enabled ? (
            <div className={styles.panelPreview}>
              {/* The sample name ("Carrie") until the shopper types, then theirs — full width, square */}
              <img src={preview ?? product.image} alt={preview ? 'Live preview' : product.name} className={styles.panelPreviewFull} />
              {preview && (
                <span className={styles.panelPreviewNote}>
                  <LivePreviewNote disclaimer={livePreview.disclaimer} loading={loading} />
                </span>
              )}
            </div>
          ) : undefined}
        >
          {/* The name, Save right under it */}
          <div ref={tapPanelRef} className={`${styles.stepFields} ${styles.tapPanelBody}`}>
            {tapFields.map((f) => renderField(f, undefined, { inPanel: true }))}
            <Button variant="primary" className={styles.cta} onClick={handleSaveName}>Save</Button>
          </div>
        </CustomizerPanel>
      )}

      {/* ── Panel: steps in the slide-in sheet, preview on top (mobile) ── */}
      {container === 'panel' && (
        <CustomizerPanel
          open={usePanel && entered}
          onClose={() => setEntered(false)}
          ariaLabel={rowMode ? rowCopy.title : jewelry ? 'Personalize yours' : entryCta}
          desktop="hidden"
          closeIcon={<XIcon size={20} />}
          // V5: no title bar — the preview runs to the top, a 44px X over its corner
          closeSize={jewelry ? 'large' : 'default'}
          scrollResetKey={stepIdx}
          fitContent={compactPanel || jewelry}
          previewFullBleed={compactPanel || jewelry}
          preview={livePreview.enabled ? (
            <div className={`${styles.panelPreview} ${jewelry ? styles.panelPreviewStack : ''}`}>
              {/* The product's own image until the shopper types, then the preview */}
              <img src={preview ?? product.image} alt={preview ? 'Live preview' : product.name} className={compactPanel || jewelry ? styles.panelPreviewFull : styles.panelPreviewImg} />
              {preview && (
                <span className={styles.panelPreviewNote}>
                  <LivePreviewNote disclaimer={livePreview.disclaimer} loading={loading} />
                </span>
              )}
            </div>
          ) : undefined}
          footer={compactPanel ? undefined : stepCta}
        >
          {compactPanel ? (
            /* As v3's: the fields, Save right under them */
            <div className={`${styles.stepFields} ${styles.tapPanelBody}`}>
              {stepFields(template, steps[0]).map((f) => renderField(f, steps[0].display?.[f.fieldId], { inPanel: true }))}
              {stepCta}
            </div>
          ) : (
            <>
              {/* In the sheet the tabs stand on their own, so they get a frame of their own */}
              <div className={styles.panelTabs}>{stepHeader}</div>
              <div className={styles.panelBody} role="tabpanel">{renderStep(stepIdx)}</div>
            </>
          )}
        </CustomizerPanel>
      )}
    </section>
  )
}
