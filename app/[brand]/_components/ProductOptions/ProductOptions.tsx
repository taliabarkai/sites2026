'use client'

import type { ReactNode } from 'react'
import { isChoiceGroup, type OptionGroup } from './types'
import type { ProductOptionsController } from './useProductOptions'
import { AddonOptions } from './AddonOptions'
import { OptionDrawer } from './OptionDrawer'
import { OptionDropdown } from './OptionDropdown'
import { OptionRadioGroup } from './OptionRadioGroup'
import { OptionSelect } from './OptionSelect'
import { TextInputOption } from './TextInputOption'
import styles from './ProductOptions.module.css'

export interface ProductOptionsProps {
  groups: OptionGroup[]
  /** From useProductOptions — held by the page so price, subtotal and Add to Bag share it. */
  options: ProductOptionsController
  /** The item's price before any option. */
  basePrice: number
  /** Extra content under a group's field, by group id (e.g. a helper under the text field). */
  slots?: Record<string, ReactNode>
}

/**
 * Renders any list of option groups from config. The `display` picks the
 * container; the `tile` picks how each value is drawn.
 */
export function ProductOptions({ groups, options, basePrice, slots }: ProductOptionsProps) {
  const { state, choose, setText, toggleAddon, itemPrice } = options

  return (
    <div className={styles.root}>
      {groups.map((group) => {
        if (group.kind === 'text-input') {
          return (
            <TextInputOption key={group.id} group={group} value={state.text[group.id] ?? ''} onChange={(v) => setText(group.id, v)}>
              {slots?.[group.id]}
            </TextInputOption>
          )
        }

        if (group.kind === 'addon') {
          return (
            <AddonOptions
              key={group.id}
              group={group}
              selectedIds={state.addons[group.id] ?? []}
              onToggle={(itemId) => toggleAddon(group.id, itemId)}
              itemPrice={itemPrice}
            />
          )
        }

        if (!isChoiceGroup(group)) return null
        const value = state.choices[group.id] ?? ''
        const onChange = (valueId: string) => choose(group.id, valueId)

        switch (group.display) {
          case 'select':
            return <OptionSelect key={group.id} group={group} value={value} onChange={onChange} />
          case 'list-dropdown':
          case 'panel-dropdown':
            return <OptionDropdown key={group.id} group={group} value={value} onChange={onChange} basePrice={basePrice} />
          case 'drawer':
            return <OptionDrawer key={group.id} group={group} value={value} onChange={onChange} />
          case 'carousel':
          case 'grid':
            return <OptionRadioGroup key={group.id} group={group} value={value} onChange={onChange} />
        }
      })}
    </div>
  )
}
