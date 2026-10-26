'use client'

import { useEffect, useId, useRef, useState } from 'react'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import { Button } from '../Button'
import { PanelPortal } from '../PanelPortal'
import { layerZIndex, usePanelLayer } from '../PanelStack'
import { QuickAddPanelContent } from '../QuickAddPanel'
import type { QuickAddFormValues, QuickAddProduct } from '../QuickAddPanel'
import type { CartItem } from '../../_context/CartContext'
import type { NestedTriggerStyle } from '../../_config/demoParams'
import { nestedItemKey } from './NestedItems'
import styles from './NestedItemsDrawer.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

type Brand = keyof typeof BRAND_ICONS

/** Thumbnails shown under the trigger before the rest collapse into "+N". */
const MAX_TRIGGER_THUMBS = 4

/** How a product shows its nested items: the inline card list, or a trigger that opens this drawer. */
export type NestedItemsDisplay = 'inline' | 'drawer'

export interface NestedItemsDrawerProps {
  brand: string
  /** Companion products. One with options is personalized first; one without is a quick add. */
  items: QuickAddProduct[]
  /** The staged (selected) items, by `nestedItemKey`. */
  staged: Record<string, CartItem>
  onStage: (key: string, item: CartItem) => void
  onUnstage: (key: string) => void
  /** The section heading — the trigger's text and the drawer's title. */
  title?: string
  /** The PDP trigger: a bordered field (default), or a text link with an arrow. */
  triggerStyle?: NestedTriggerStyle
}

function fmt(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

function isPersonalized(item: QuickAddProduct): boolean {
  return item.options.length > 0
}

// A quick add has nothing to configure, so it is staged at its base price.
function quickAddCartItem(item: QuickAddProduct): CartItem {
  return {
    id: `nested-${item.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
    name: item.title,
    price: item.price,
    originalPrice: item.salePrice ? item.price : undefined,
    image: item.images[0]?.src ?? '',
    isPersonalized: false,
    rating: item.rating,
    reviewCount: item.reviewCount,
    selectedOptions: [],
  }
}

/**
 * Nested Items, Drawer layout — one trigger on the PDP that opens a
 * multi-select grid of companion products. A bottom sheet on mobile, a
 * right-hand drawer from 768px.
 *
 * A quick-add product toggles on tap. A personalized one turns the drawer into
 * the Quick Add form — it slides in over the grid, within the same panel — in
 * its nested form (CTA "Add", no "View Full Details"), and is staged on Add;
 * "Edit" reopens it as it was, to Update. Tapping a staged card removes it.
 */
export function NestedItemsDrawer({ brand, items, staged, onStage, onUnstage, title = 'Add More Charms', triggerStyle = 'field' }: NestedItemsDrawerProps) {
  const titleId = useId()
  const { ArrowIcon, XIcon, CheckboxIcon, CheckmarkIcon, ChevronIcon } = BRAND_ICONS[brand as Brand] ?? BRAND_ICONS.oal

  const [open, setOpen] = useState(false)
  // The editor — the Quick Add form, over the grid. Its item stays set while it
  // slides back out; each opening is a new session, so the form starts afresh.
  const [editorItem, setEditorItem] = useState<QuickAddProduct | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorSession, setEditorSession] = useState(0)
  // Each personalized item's last added choices, so Edit and re-adding restore them
  const [savedForms, setSavedForms] = useState<Record<string, QuickAddFormValues>>({})

  const close = () => {
    setOpen(false)
    setEditorOpen(false)
  }
  // A click outside or Escape steps back one level: out of the editor to the
  // grid, or, from the grid, closes the drawer. The close buttons close it all.
  const dismiss = () => {
    if (editorOpen) setEditorOpen(false)
    else close()
  }
  const panelRef = useRef<HTMLDivElement>(null)
  const depth = usePanelLayer(open, dismiss, panelRef)
  const stackZ = layerZIndex(depth)

  // Moving between the grid and the editor: focus the editor's back button, or
  // return to the card that opened it.
  const backRef = useRef<HTMLButtonElement>(null)
  const returnKey = useRef<string | null>(null)
  useEffect(() => {
    if (!open) return
    if (editorOpen) {
      backRef.current?.focus({ preventScroll: true })
    } else if (returnKey.current) {
      panelRef.current
        ?.querySelector<HTMLElement>(`[data-key="${CSS.escape(returnKey.current)}"]`)
        ?.focus()
      returnKey.current = null
    }
  }, [editorOpen, open])

  const personalize = (item: QuickAddProduct) => {
    returnKey.current = nestedItemKey(item)
    setEditorItem(item)
    setEditorSession((n) => n + 1)
    setEditorOpen(true)
  }

  const editorKey = editorItem ? nestedItemKey(editorItem) : null
  const editingStaged = Boolean(editorKey && staged[editorKey])

  const handleCardClick = (item: QuickAddProduct) => {
    const key = nestedItemKey(item)
    if (staged[key]) onUnstage(key)
    else if (isPersonalized(item)) personalize(item)
    else onStage(key, quickAddCartItem(item))
  }

  const picked = items.filter((item) => staged[nestedItemKey(item)])
  const isLink = triggerStyle === 'link'
  // One string for the trigger and the drawer footer, so it's translated once
  const countText = `${picked.length}/${items.length} selected`
  // Up to four thumbnails under the trigger, then a "+N" tile for the rest
  const shownPicks = picked.slice(0, MAX_TRIGGER_THUMBS)
  const morePicks = picked.length - shownPicks.length

  return (
    <section className={styles.section}>
      {/* One button, picks included — anywhere in it opens the drawer. Its
          label carries the count, so the thumbnails are decoration to it. */}
      <button
        type="button"
        className={isLink ? styles.linkBox : styles.triggerBox}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={picked.length > 0 ? `${title}, ${countText}` : title}
        onClick={() => setOpen(true)}
      >
        <span className={isLink ? styles.linkTrigger : styles.trigger}>
          <span className={isLink ? styles.linkText : styles.triggerText}>{title}</span>
          {!isLink && picked.length > 0 && <span className={styles.triggerCount}>{countText}</span>}
          {isLink ? (
            // 24px icon area, 20px arrow inside it
            <span className={styles.linkIcon} aria-hidden="true">
              <ArrowIcon size={20} />
            </span>
          ) : (
            <ArrowIcon size={24} />
          )}
          {isLink && picked.length > 0 && (
            <span className={`${styles.triggerCount} ${styles.linkCount}`}>{countText}</span>
          )}
        </span>

        {picked.length > 0 && (
          <span className={`${styles.picks} ${isLink ? styles.picksLink : ''}`} aria-hidden="true">
            {shownPicks.map((item) => (
              <span key={nestedItemKey(item)} className={styles.pickThumb}>
                {item.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0].src} alt="" className={styles.image} />
                )}
              </span>
            ))}
            {morePicks > 0 && <span className={styles.pickMore}>+{morePicks}</span>}
          </span>
        )}
      </button>

      <PanelPortal>
        <div
          className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
          style={stackZ.backdrop}
          aria-hidden="true"
          onClick={dismiss}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
          style={stackZ.panel}
          inert={!open}
        >
          <div className={styles.header}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <button type="button" className={styles.iconBtn} aria-label="Close" onClick={close}>
              <XIcon size={24} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.grid}>
              {items.map((item) => {
                const key = nestedItemKey(item)
                const stagedItem = staged[key]
                const checked = Boolean(stagedItem)
                const personalized = isPersonalized(item)
                const img = item.images[0]

                return (
                  <div key={key} className={`${styles.card} ${checked ? styles.cardChecked : ''}`}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      aria-label={`${checked ? 'Remove' : 'Add'} ${item.title}${personalized && !checked ? ', personalize first' : ''}`}
                      data-key={key}
                      className={styles.cardMain}
                      onClick={() => handleCardClick(item)}
                    >
                      <span className={styles.media}>
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.src} alt="" className={styles.image} loading="lazy" />
                        )}
                      </span>

                      {/* Visual checkbox indicator — top-right corner */}
                      <span className={styles.checkbox} aria-hidden="true">
                        {checked ? (
                          <span className={styles.checkboxChecked}>
                            <CheckmarkIcon size={12} />
                          </span>
                        ) : (
                          <CheckboxIcon size={24} />
                        )}
                      </span>

                      <span className={styles.info}>
                        <span className={styles.name}>{item.title}</span>
                        <span className={styles.priceRow}>
                          {item.salePrice != null && (
                            <span className={styles.priceOriginal}>{fmt(item.salePrice, item.currency)}</span>
                          )}
                          <span className={styles.price}>{fmt(stagedItem?.price ?? item.price, item.currency)}</span>
                        </span>
                      </span>
                    </button>

                    {personalized && checked && (
                      <button
                        type="button"
                        className={styles.edit}
                        aria-label={`Edit ${item.title}`}
                        onClick={() => personalize(item)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <span className={styles.count}>{countText}</span>
            <Button className={styles.doneBtn} onClick={close}>
              Done
            </Button>
          </div>

          {/* The editor — the Quick Add form (nested: CTA "Add", no "View Full
              Details"), sliding in over the grid within this same panel */}
          <div
            className={`${styles.editor} ${editorOpen ? styles.editorOpen : ''}`}
            inert={!editorOpen}
          >
            {/* Close — top right, where the Quick Add panel keeps its own */}
            <button type="button" className={`${styles.iconBtn} ${styles.editorClose}`} aria-label="Close" onClick={close}>
              <XIcon size={24} />
            </button>

            {editorItem && editorKey && (
              <QuickAddPanelContent
                key={editorSession}
                product={editorItem}
                ctaLabel={editingStaged ? 'Update' : 'Add'}
                showViewDetails={false}
                embedded
                initialValues={savedForms[editorKey]}
                onAdd={(cartItem, values) => {
                  onStage(editorKey, cartItem)
                  setSavedForms((prev) => ({ ...prev, [editorKey]: values }))
                }}
                onDone={() => setEditorOpen(false)}
                headerStart={
                  // Back to the grid — above the name, level with the close button
                  <button ref={backRef} type="button" className={styles.editorBack} onClick={() => setEditorOpen(false)}>
                    <span className={styles.editorBackIcon} aria-hidden="true">
                      <ChevronIcon size={20} />
                    </span>
                    Back
                  </button>
                }
              />
            )}
          </div>
        </div>
      </PanelPortal>
    </section>
  )
}
