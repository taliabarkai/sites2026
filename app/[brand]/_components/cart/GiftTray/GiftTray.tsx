'use client'

import { useId } from 'react'
import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { Button } from '../../Button'
/* The card is the one the checkout already uses — packaging image, name, price
   and an Add pill. Imported, not rebuilt, so the offer looks the same wherever
   it is made. */
import { GiftOptionCard } from '../GiftingOptions/GiftOptionCard'
/* The wrapped state the checkout draws, imported rather than drawn again: the
   bag page and the checkout are reporting the same thing, so they say it in
   the same card. */
import { AssignedItemRow } from '../GiftingOptions/AssignedItemRow'
import { type DesignOption, type GiftOption, type GiftingIcons } from '../GiftingOptions/types'
import styles from './GiftTray.module.css'

export interface GiftTrayIcons extends GiftingIcons {
  CheckmarkIcon: React.ComponentType<IconProps>
}

interface GiftTrayProps {
  /** The line this tray belongs to. */
  itemId: string
  /** Turns the stored design key back into the artwork that was chosen. */
  designs: DesignOption[]
  /** The design saved against this line, if its packaging has any. */
  selectedDesign?: string
  /** Reopens the panel on what was already chosen. */
  onEdit: (option: GiftOption) => void
  /** Open state is lifted, so the control and the panel can live in different
   *  places in the caller's layout. */
  open: boolean
  onToggle: () => void
  /** The line this tray belongs to — every tray is one item's. */
  itemName: string
  /** The packaging this item can take. */
  options:  GiftOption[]
  /**
   * Whether these options are the item's own rather than the brand's catalogue.
   * Read off the data, never the brand key: a product that ships its own option
   * is offering a note cut to that piece, not packaging the brand stocks, so
   * the control has to say so.
   */
  optionsAreItemBound: boolean
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
  itemId, itemName, options, optionsAreItemBound, selectedOptionId, designs,
  selectedDesign, icons, open, onToggle, onSelect, onRemove, onEdit,
}: GiftTrayProps) {
  const panelId = useId()

  const { GiftIcon, PlusMinusIcon } = icons
  const selected = options.find(o => o.id === selectedOptionId) ?? null

  // Already chosen: the tray's job is done, so it steps aside for the card the
  // checkout shows for the same state — the chosen artwork, what it wraps, its
  // price, and Edit and remove down the right-hand edge.
  if (selected) {
    return (
      <ul className={styles.addedList}>
        <AssignedItemRow
          item={{ id: itemId, name: itemName, imageUrl: '' }}
          option={selected}
          assignment={{
            itemId, optionId: selected.id, note: '',
            design: selectedDesign ?? null, pname: '', photo: false,
          }}
          icons={icons}
          designs={designs}
          onEdit={() => onEdit(selected)}
          onRemove={onRemove}
        />
      </ul>
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
        {optionsAreItemBound ? 'Add Gift Note' : 'Add Gift Packaging'}
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
