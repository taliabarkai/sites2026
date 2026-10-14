'use client'

import { useId, useState } from 'react'
import type { AddonGroup, AddonItem } from './types'
import { formatPrice } from './format'
import { addonPrice } from './useProductOptions'
import { ScrollRow } from './ScrollRow'
import { useOptionIcons } from './useOptionIcons'
import { Modal } from '../Modal'
import styles from './ProductOptions.module.css'

export interface AddonOptionsProps {
  group: AddonGroup
  selectedIds: string[]
  onToggle: (itemId: string) => void
  /** The configured item's price — for add-ons priced as a share of it. */
  itemPrice: number
}

/**
 * `addon` — horizontal cards (image left; title, price, "More Details";
 * a radio-style toggle top-right). Each card toggles on its own, so the
 * group is multi-select: every card is a checkbox. All start off.
 */
export function AddonOptions({ group, selectedIds, onToggle, itemPrice }: AddonOptionsProps) {
  const id = useId()
  const labelId = `${id}-label`
  const [detailsItem, setDetailsItem] = useState<AddonItem | null>(null)
  const { XIcon } = useOptionIcons()

  const cards = group.items.map((item) => (
    <AddonCard
      key={item.id}
      item={item}
      selected={selectedIds.includes(item.id)}
      price={addonPrice(item, itemPrice)}
      fullPrice={item.percentOfItem ? itemPrice : undefined}
      onToggle={() => onToggle(item.id)}
      onDetails={item.details ? () => setDetailsItem(item) : undefined}
    />
  ))

  const label = (
    <p id={labelId} className={styles.groupLabel}>
      {group.label}
    </p>
  )

  return (
    <>
      {group.layout === 'carousel' ? (
        <ScrollRow label={label} rowProps={{ role: 'group', 'aria-labelledby': labelId }} rowClassName={styles.addonRow}>
          {cards}
        </ScrollRow>
      ) : (
        <div className={styles.group} role="group" aria-labelledby={labelId}>
          {label}
          {cards}
        </div>
      )}

      <Modal
        open={detailsItem !== null}
        onClose={() => setDetailsItem(null)}
        labelledBy={`${id}-details`}
        closeIcon={<XIcon size={24} />}
        className={styles.detailsModal}
      >
        <h2 id={`${id}-details`} className={styles.drawerTitle}>
          {detailsItem?.title}
        </h2>
        <p className={styles.detailsText}>{detailsItem?.details}</p>
      </Modal>
    </>
  )
}

function AddonCard({
  item,
  selected,
  price,
  fullPrice,
  onToggle,
  onDetails,
}: {
  item: AddonItem
  selected: boolean
  price: number
  /** Shown struck through when the add-on is a discount on the item. */
  fullPrice?: number
  onToggle: () => void
  onDetails?: () => void
}) {
  const { CheckmarkIcon } = useOptionIcons()
  return (
    // The toggle button stretches over the whole card; "More Details" sits above it
    <div className={`${styles.addonCard} ${selected ? styles.addonCardSelected : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt="" className={styles.addonImage} loading="lazy" />
      <div className={styles.addonInfo}>
        <span className={styles.addonTitle}>{item.title}</span>
        <span className={styles.addonPrices}>
          {fullPrice !== undefined && <span className={styles.addonPriceOriginal}>{formatPrice(fullPrice)}</span>}
          <span className={styles.addonPrice}>{formatPrice(price)}</span>
        </span>
        {onDetails && (
          <button type="button" className={styles.addonDetails} onClick={onDetails}>
            More Details
          </button>
        )}
      </div>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={`${item.title}, ${formatPrice(price)}`}
        className={styles.addonToggle}
        onClick={onToggle}
      >
        <span className={styles.addonRadio} aria-hidden="true">
          {selected && <CheckmarkIcon size={12} />}
        </span>
      </button>
    </div>
  )
}
