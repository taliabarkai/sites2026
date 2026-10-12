'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import { useCart } from '../../_context/CartContext'
import type { CartItem } from '../../_context/CartContext'
import { Button } from '../Button'
import { ProductCard } from '../ProductCard'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import { closeAllPanels } from '../PanelStack'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './ShopTheLookProductRow.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface ShopTheLookProductRowProps {
  product: QuickAddProduct
}

type AddState = 'idle' | 'loading' | 'success'

function formatCents(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

/** Personalized = the product takes engraving / initials text. */
export function isPersonalized(product: QuickAddProduct): boolean {
  return product.options.some((o) => o.type === 'text-input')
}

/** A choice with more than one value and no safe default (e.g. ring size). */
export function needsSelection(product: QuickAddProduct): boolean {
  return product.options.some(
    (o) => (o.type === 'pills' || o.type === 'dropdown') && (o.values?.length ?? 0) > 1,
  )
}

/**
 * The selected product in the Shop The Look V2 panel: the category ProductCard
 * in its horizontal layout (thumbnail left; rating, name, price right) with a
 * full-width CTA below it.
 *  • Personalized → "Personalize" opens Quick Add stacked on the panel.
 *  • Needs a choice with no safe default (ring size) → "Add to Bag" opens Quick Add.
 *  • Otherwise → "Add to Bag" adds the default variant directly, then the bag
 *    opens exactly as after a Quick Add from the grid.
 */
export function ShopTheLookProductRow({ product }: ShopTheLookProductRowProps) {
  const brand = getBrandFromPathname(usePathname())
  const { StarIcon } = BRAND_ICONS[brand]
  const { addItem, openCart } = useCart()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [addState, setAddState] = useState<AddState>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const personalized = isPersonalized(product)
  const opensQuickAdd = personalized || needsSelection(product)

  const addDirectly = () => {
    // Default variant: the first value of every option.
    const selectedOptions = product.options
      .map((o) => ({ label: o.name, value: o.values?.[0]?.label ?? '' }))
      .filter((o) => o.value)
    const price = product.options.reduce((sum, o) => sum + (o.values?.[0]?.price ?? 0), product.price)
    const item: CartItem = {
      id: `stl-${product.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      name: product.title,
      price,
      originalPrice: product.salePrice ? product.price : undefined,
      image: product.images[0]?.src ?? '',
      isPersonalized: false,
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions,
    }

    setAddState('loading')
    timers.current.push(setTimeout(() => {
      addItem(item)
      setAddState('success')
      timers.current.push(setTimeout(() => {
        closeAllPanels()
        openCart(true)
        setAddState('idle')
      }, 800))
    }, 500))
  }

  const handleCta = () => {
    if (opensQuickAdd) setQuickAddOpen(true)
    else if (addState === 'idle') addDirectly()
  }

  const ctaLabel = personalized
    ? 'Personalize'
    : addState === 'loading' ? 'Adding…'
    : addState === 'success' ? 'Added to Bag'
    : 'Add to Bag'

  return (
    <div className={styles.root}>
      <ProductCard
        layout="horizontal"
        squareImage
        name={product.title}
        price={formatCents(product.price, product.currency)}
        originalPrice={product.salePrice ? formatCents(product.salePrice, product.currency) : undefined}
        defaultImage={product.images[0]?.src ?? ''}
        hoverImage={product.images[1]?.src}
        href={`/${brand}${product.pdpUrl}`}
        rating={product.rating}
        reviewCount={product.reviewCount}
        StarIcon={StarIcon}
      />

      <Button
        variant={personalized ? 'primary' : 'add-to-cart'}
        className={styles.cta}
        aria-haspopup={opensQuickAdd ? 'dialog' : undefined}
        aria-busy={addState === 'loading' || undefined}
        disabled={addState !== 'idle'}
        onClick={handleCta}
      >
        {ctaLabel}
      </Button>
      <span className={styles.srOnly} aria-live="polite">
        {addState === 'loading' ? `Adding ${product.title} to bag`
          : addState === 'success' ? `${product.title} added to bag` : ''}
      </span>

      {opensQuickAdd && (
        <QuickAddPanel
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          product={product}
        />
      )}
    </div>
  )
}
