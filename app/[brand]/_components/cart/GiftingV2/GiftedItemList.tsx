'use client'

/* The wrapped card is V1's, imported unchanged: the two variants show the same
   thing once an item is wrapped, so they should show it the same way. */
import { AssignedItemRow } from '../GiftingOptions/AssignedItemRow'
import {
  optionsForItem,
  type DesignOption,
  type GiftAssignment,
  type GiftOption,
} from '../GiftingOptions/types'
import type { GiftItem, GiftingV2Icons } from './GiftPanel'
import styles from './GiftingV2.module.css'

interface GiftedItemListProps {
  /** Only the wrapped lines; what is still to do is offered as option cards. */
  items:       GiftItem[]
  /** The brand's shared catalog; an item's own options override it. */
  options:     GiftOption[]
  assignments: GiftAssignment[]
  icons:       GiftingV2Icons
  /** Needed to turn a stored design key back into the image that ships. */
  designs:     DesignOption[]
  onEdit:   (assignment: GiftAssignment) => void
  onRemove: (itemId: string) => void
}

/**
 * The wrapped items, and nothing else.
 *
 * V2 never lists the unwrapped ones: packaging is chosen from the cards in
 * both states, and the panel asks which of the remaining items it is for. A
 * product list here would offer a second, contradictory way in.
 */
export function GiftedItemList({
  items, options, assignments, icons, designs, onEdit, onRemove,
}: GiftedItemListProps) {
  return (
    <ul className={styles.itemList}>
      {items.map(item => {
        const assignment = assignments.find(a => a.itemId === item.id)
        if (!assignment) return null

        const assigned = optionsForItem(item, options)
          .find(o => o.id === assignment.optionId)
        if (!assigned) return null

        return (
          <AssignedItemRow
            key={item.id}
            item={item}
            option={assigned}
            assignment={assignment}
            icons={icons}
            designs={designs}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        )
      })}
    </ul>
  )
}
