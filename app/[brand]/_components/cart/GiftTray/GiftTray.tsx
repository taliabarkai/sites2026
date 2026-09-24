'use client'

import { useId } from 'react'
import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { Button } from '../../Button'
/* The card is the one the checkout already uses — packaging image, name, price
   and an Add pill. Imported, not rebuilt, so the offer looks the same wherever
   it is made. */
import { GiftOptionCard } from '../GiftingOptions/GiftOptionCard'
import { formatPrice, type GiftOption, type GiftingIcons } from '../GiftingOptions/types'
import styles from './GiftTray.module.css'

export interface GiftTrayIcons extends GiftingIcons {
  CheckmarkIcon: React.ComponentType<IconProps>
}

interface GiftTrayProps {
  /** Open state is lifted, so the control and the panel can live in different
   *  places in the caller's layout. */
  open: boolean
  onToggle: () => void
  /** The line this tray belongs to — every tray is one item's. */
  itemName: string
  /** The packaging this item can take. */
  options:  GiftOption[]
  /** The option currently on the item, if any. */
  selectedOptionId?: string
  icons:    GiftTrayIcons
  onSelect: (option: GiftOption) => void
  onRemove: () => void
}

/**
 * Per-item gift packaging, collapsed behind a single control.
 *
 * Deliberately per item rather than per bag: packaging is bought for a
 * particular piece, and one control under the whole bag cannot say which. No
 * warranty here on any brand — that belongs to the floating cart.
 */
export function GiftTray({
  itemName, options, selectedOptionId, icons, open, onToggle, onSelect, onRemove,
}: GiftTrayProps) {
  const panelId = useId()

  const { GiftIcon, PlusMinusIcon, CheckmarkIcon, TrashCanIcon } = icons
  const selected = options.find(o => o.id === selectedOptionId) ?? null

  // Already chosen: the tray's job is done, so it steps aside for what was
  // added and a way to undo it.
  if (selected) {
    return (
      <div className={styles.added}>
        <span className={styles.addedCheck} aria-hidden="true">
          <CheckmarkIcon size={16} />
        </span>
        <span className={styles.addedName}>{selected.name}</span>
        <span className={styles.addedPrice}>{formatPrice(selected.price)}</span>
        <button
          type="button"
          className={styles.addedRemove}
          aria-label={`Remove gift packaging from ${itemName}`}
          onClick={onRemove}
        >
          <TrashCanIcon size={20} />
        </button>
      </div>
    )
  }

  if (options.length === 0) return null

  return (
    <div className={styles.tray}>
      <Button
        variant="upsell-primary"
        aria-expanded={open}
        aria-controls={panelId}
        leadingIcon={<GiftIcon size={24} />}
        trailingIcon={
          open
            // The icon set has a plus but no minus, so the open state draws the
            // bar on its own rather than inventing a second icon.
            ? <span className={styles.minus} aria-hidden="true" />
            : <PlusMinusIcon size={24} />
        }
        onClick={onToggle}
      >
        Add Gift Packaging
      </Button>

    </div>
  )
}

interface GiftTrayPanelProps {
  options:  GiftOption[]
  icons:    GiftTrayIcons
  onSelect: (option: GiftOption) => void
}

/**
 * The cards the control opens, rendered separately from it.
 *
 * Split apart on purpose: the control belongs beside the price, centred against
 * the product image, while the cards have to grow downward without disturbing
 * anything above them. Keeping both in one box made the row's height jump the
 * moment it opened.
 */
export function GiftTrayPanel({ options, icons, onSelect }: GiftTrayPanelProps) {
  return (
    <div className={styles.options}>
      {options.map(option => (
        <GiftOptionCard key={option.id} option={option} icons={icons} onSelect={onSelect} />
      ))}
    </div>
  )
}
