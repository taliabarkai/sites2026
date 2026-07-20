'use client'

import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import type { QuickAddProduct } from '../QuickAddPanel'
import styles from './NestedItems.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

type Brand = keyof typeof BRAND_ICONS

export interface NestedItemsProps {
  brand: string
  /** Companion / add-on products, each shaped for the quick-add panel. */
  items: QuickAddProduct[]
  /** Stable keys of the items currently staged (checked). */
  checkedKeys: Set<string>
  /** Fired when a card's checkbox is toggled. `checked` is the NEW state. */
  onToggle: (item: QuickAddProduct, checked: boolean) => void
  /** Section heading. Defaults to "Your Stack Starts Here". */
  title?: string
}

function fmt(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

/** Stable identity for a nested item — QuickAddProduct has no id, so use its PDP url. */
export function nestedItemKey(item: QuickAddProduct): string {
  return item.pdpUrl
}

export function NestedItems({ brand, items, checkedKeys, onToggle, title = 'Your Stack Starts Here' }: NestedItemsProps) {
  if (items.length === 0) return null

  const icons = BRAND_ICONS[brand as Brand] ?? BRAND_ICONS.oal
  const { CheckboxIcon, CheckmarkIcon } = icons

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>
      {items.map((item) => {
        const key = nestedItemKey(item)
        const checked = checkedKeys.has(key)
        const img = item.images[0]

        return (
          <button
            key={key}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={`${checked ? 'Remove' : 'Add'} ${item.title}`}
            className={styles.card}
            onClick={() => onToggle(item, !checked)}
          >
            <span className={styles.media}>
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.src} alt={img.alt} className={styles.image} loading="lazy" />
              )}
            </span>

            <span className={styles.info}>
              <span className={styles.name}>{item.title}</span>
              <span className={styles.priceRow}>
                {item.salePrice != null && (
                  <span className={styles.priceOriginal}>{fmt(item.salePrice, item.currency)}</span>
                )}
                <span className={styles.price}>{fmt(item.price, item.currency)}</span>
              </span>
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
          </button>
        )
      })}
      </div>
    </section>
  )
}
