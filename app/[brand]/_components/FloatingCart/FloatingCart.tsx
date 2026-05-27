'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { getBrandFromPathname, getGiftOptionsMode, getBrandGiftAssets } from '../../_config/brands'
import type { BrandKey } from '../../_config/brands'
import { useCart } from '../../_context/CartContext'
import { Button } from '../Button'
import { GiftOptionsModal } from './GiftOptionsModal'
import type { SavedGift } from './GiftOptionsModal'
import { GiftPackagingPanel } from '../GiftPackagingPanel/GiftPackagingPanel'
import type { CartItem } from '../../_context/CartContext'
import styles from './FloatingCart.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

export interface FloatingCartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  onRemoveItem: (id: string) => void
  onEditItem: (id: string) => void
  onContinueToCheckout: () => void
  onGenerateGiftNote: () => Promise<string>
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

interface CartItemRowProps {
  item: CartItem
  brand: BrandKey
  onRemove: (id: string) => void
  onEdit: (id: string) => void
  onGenerateGiftNote: () => Promise<string>
  GiftIcon: React.ComponentType<{ size?: number }>
  PlusMinusIcon: React.ComponentType<{ size?: number }>
  DropdownIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
}

function CartItemRow({ item, brand, onRemove, onEdit, onGenerateGiftNote, GiftIcon, PlusMinusIcon, DropdownIcon, CheckmarkIcon }: CartItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [savedGift, setSavedGift] = useState<SavedGift | null>(null)
  const [giftPanelOpen, setGiftPanelOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { updateGiftPackaging } = useCart()
  const isMultiple = getGiftOptionsMode(brand) === 'multiple'
  const giftAssets = isMultiple ? getBrandGiftAssets(brand) : null

  const handleRemoveConfirm = () => {
    onRemove(item.id)
  }

  return (
    <article className={styles.item}>
      {/* Single-mode gift modal */}
      {!isMultiple && giftModalOpen && (
        <GiftOptionsModal
          onClose={() => setGiftModalOpen(false)}
          onAddToCart={(gift) => {
            setSavedGift(gift)
            setGiftModalOpen(false)
          }}
          onGenerateGiftNote={onGenerateGiftNote}
        />
      )}

      {/* Multi-mode gift panel */}
      {isMultiple && giftPanelOpen && (
        <GiftPackagingPanel
          onClose={() => setGiftPanelOpen(false)}
          onAddToCart={(gift) => {
            updateGiftPackaging(item.id, gift)
            setGiftPanelOpen(false)
          }}
          initialGift={item.giftPackaging}
          productName={item.name}
        />
      )}

      <p className={styles.deliveryGuarantee}>Guaranteed to arrive by Christmas</p>
      <div className={styles.itemMain}>
        <div className={styles.itemImageWrap}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.itemImage}
          />
        </div>

        <div className={styles.itemBody}>
          <p className={styles.itemName}>{item.name}</p>

          <div className={styles.itemPriceRow}>
            {item.originalPrice != null && (
              <span className={styles.itemOriginalPrice}>{formatPrice(item.originalPrice)}</span>
            )}
            <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
          </div>

          {hasOptions && (
            <div className={styles.detailsBlock}>
              <button
                type="button"
                className={styles.detailsToggle}
                aria-expanded={detailsOpen}
                onClick={() => setDetailsOpen(o => !o)}
              >
                View Details <DropdownIcon size={16} />
              </button>
              {detailsOpen && (
                <dl className={styles.optionsList}>
                  {item.selectedOptions!.map(opt => (
                    <div key={opt.label} className={styles.optionRow}>
                      <dt className={styles.optionKey}>{opt.label}</dt>
                      <dd className={styles.optionValue}>{opt.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          <div className={styles.itemActions}>
            <button type="button" className={styles.editLink} onClick={() => onEdit(item.id)}>
              Edit
            </button>

            <span className={styles.actionsDivider} aria-hidden="true" />

            {confirmRemove ? (
              <span className={styles.removeConfirm}>
                Remove item?{' '}
                <button type="button" className={styles.removeConfirmYes} onClick={handleRemoveConfirm}>
                  Yes
                </button>
                {' / '}
                <button type="button" className={styles.removeConfirmCancel} onClick={() => setConfirmRemove(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" className={styles.removeLink} onClick={() => setConfirmRemove(true)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Single-mode gift area ── */}
      {!isMultiple && (
        savedGift ? (
          <div className={styles.giftSaved}>
            <div className={styles.giftSavedRow}>
              <div className={styles.giftSavedImageWrap}>
                <img
                  src={savedGift.image}
                  alt="Gift packaging"
                  className={styles.giftSavedImage}
                />
              </div>
              <div className={styles.giftSavedBody}>
                <div className={styles.giftSavedNameRow}>
                  <span className={styles.giftSavedName}>{savedGift.name}</span>
                  <span className={styles.giftSavedPrice}>{savedGift.price}</span>
                </div>
                <div className={styles.itemActions}>
                  <button type="button" className={styles.editLink} onClick={() => setGiftModalOpen(true)}>
                    Edit
                  </button>
                  <span className={styles.actionsDivider} aria-hidden="true" />
                  <button type="button" className={styles.removeLink} onClick={() => setSavedGift(null)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
            {savedGift.note && (
              <p className={styles.giftNote}>
                <span className={styles.giftNoteLabel}>Gift note:</span>{' '}
                {savedGift.note}
              </p>
            )}
          </div>
        ) : (
          <Button
            variant="upsell-primary"
            leadingIcon={<GiftIcon size={24} />}
            trailingIcon={<PlusMinusIcon size={24} />}
            onClick={() => setGiftModalOpen(true)}
          >
            Add Gift Packaging
          </Button>
        )
      )}

      {/* ── Multi-mode gift area ── */}
      {isMultiple && (
        item.giftPackaging ? (
          <div className={styles.giftSaved}>
            <div className={styles.giftSavedRow}>
              <div className={styles.giftSavedImageWrap}>
                <img
                  src={
                    item.giftPackaging.type === 'classic'
                      ? giftAssets!.classicGiftImage
                      : (giftAssets?.designOptions.find(d => d.key === item.giftPackaging!.selectedDesign)?.image ?? giftAssets!.personalizedGiftImage)
                  }
                  alt="Gift packaging"
                  className={styles.giftSavedImage}
                />
              </div>
              <div className={styles.giftSavedBody}>
                <div className={styles.giftSavedNameRow}>
                  <span className={styles.giftSavedName}>
                    {item.giftPackaging.type === 'classic'
                      ? 'Classic Gift Set'
                      : `Personalized Gift Box${item.giftPackaging.selectedDesign
                          ? ` · ${giftAssets?.designOptions.find(d => d.key === item.giftPackaging!.selectedDesign)?.label ?? item.giftPackaging.selectedDesign}`
                          : ''}${item.giftPackaging.recipientName ? ` · ${item.giftPackaging.recipientName}` : ''}`
                    }
                  </span>
                  <span className={styles.giftSavedPrice}>{formatPrice(item.giftPackaging.price)}</span>
                </div>
                <div className={styles.itemActions}>
                  <button type="button" className={styles.editLink} onClick={() => setGiftPanelOpen(true)}>Edit</button>
                  <span className={styles.actionsDivider} aria-hidden="true" />
                  <button type="button" className={styles.removeLink} onClick={() => updateGiftPackaging(item.id, undefined)}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button
            variant="upsell-primary"
            leadingIcon={<GiftIcon size={24} />}
            trailingIcon={<PlusMinusIcon size={24} />}
            onClick={() => setGiftPanelOpen(true)}
          >
            Add Gift Packaging
          </Button>
        )
      )}
    </article>
  )
}

export function FloatingCart({
  isOpen,
  onClose,
  items,
  subtotal,
  onRemoveItem,
  onEditItem,
  onContinueToCheckout,
  onGenerateGiftNote,
}: FloatingCartProps) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const icons = BRAND_ICONS[brand]
  const { XIcon } = icons
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const el = panelRef.current
    if (!el) return
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])')
    )
    focusables[0]?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            My Bag {items.length > 0 && <span className={styles.count}>({items.length})</span>}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close cart"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Your bag is empty.</p>
              <Button href="#" variant="secondary" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                brand={brand}
                onRemove={onRemoveItem}
                onEdit={onEditItem}
                onGenerateGiftNote={onGenerateGiftNote}
                GiftIcon={icons.GiftIcon}
                PlusMinusIcon={icons.PlusMinusIcon}
                DropdownIcon={icons.DropdownIcon}
                CheckmarkIcon={icons.CheckmarkIcon}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totals}>
              <div className={styles.subtotalRow}>
                <span className={styles.footerLabel}>Subtotal</span>
                <span className={styles.footerAmount}>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.taxRow}>
                <span className={styles.footerLabel}>Tax</span>
                <span className={styles.taxNote}>Calculated at checkout</span>
              </div>
            </div>
            <Button variant="add-to-cart" href={`/${brand}/checkout`} className={styles.checkoutBtn}>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
