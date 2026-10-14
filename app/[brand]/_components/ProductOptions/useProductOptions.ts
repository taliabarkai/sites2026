'use client'

import { useMemo, useReducer } from 'react'
import { isChoiceGroup, type AddonItem, type OptionGroup, type OptionsState, type SelectedOption } from './types'

type Action =
  | { type: 'choose'; groupId: string; valueId: string }
  | { type: 'text'; groupId: string; value: string }
  | { type: 'toggle-addon'; groupId: string; itemId: string }

function reducer(state: OptionsState, action: Action): OptionsState {
  switch (action.type) {
    case 'choose':
      return { ...state, choices: { ...state.choices, [action.groupId]: action.valueId } }
    case 'text':
      return { ...state, text: { ...state.text, [action.groupId]: action.value } }
    case 'toggle-addon': {
      const current = state.addons[action.groupId] ?? []
      const next = current.includes(action.itemId)
        ? current.filter((id) => id !== action.itemId)
        : [...current, action.itemId]
      return { ...state, addons: { ...state.addons, [action.groupId]: next } }
    }
  }
}

/** Every choice group starts on its default (or first enabled) value; add-ons start off. */
function initialState(groups: OptionGroup[]): OptionsState {
  const state: OptionsState = { choices: {}, text: {}, addons: {} }
  for (const g of groups) {
    if (isChoiceGroup(g)) {
      const fallback = g.values.find((v) => !v.disabled) ?? g.values[0]
      const preset = g.values.find((v) => v.id === g.defaultValueId && !v.disabled)
      if (preset ?? fallback) state.choices[g.id] = (preset ?? fallback).id
    } else if (g.kind === 'text-input') {
      state.text[g.id] = ''
    } else {
      state.addons[g.id] = []
    }
  }
  return state
}

/**
 * Price of one add-on, given the configured item price. A share of the item
 * is rounded to the whole dollar, so the page and the bag show the same total.
 */
export function addonPrice(item: AddonItem, itemPrice: number): number {
  if (item.price !== undefined) return item.price
  return Math.round((itemPrice * (item.percentOfItem ?? 0)) / 100) * 100
}

/**
 * The page-level option state. One reducer holds every selection, so the
 * price, the subtotal and the Add to Bag payload all read from one source.
 *
 *   itemPrice = basePrice + every selected value's priceDelta
 *   subtotal  = itemPrice + every add-on that's on
 */
export function useProductOptions(groups: OptionGroup[], basePrice: number) {
  const [state, dispatch] = useReducer(reducer, groups, initialState)

  const derived = useMemo(() => {
    let itemPrice = basePrice
    const selectedOptions: SelectedOption[] = []

    for (const g of groups) {
      if (isChoiceGroup(g)) {
        const value = g.values.find((v) => v.id === state.choices[g.id])
        if (!value) continue
        itemPrice += value.priceDelta ?? 0
        selectedOptions.push({ label: g.label, value: value.label })
      } else if (g.kind === 'text-input') {
        const text = state.text[g.id]?.trim()
        if (text) selectedOptions.push({ label: g.label, value: text })
      }
    }

    let addonsTotal = 0
    for (const g of groups) {
      if (g.kind !== 'addon') continue
      for (const item of g.items) {
        if (!state.addons[g.id]?.includes(item.id)) continue
        addonsTotal += addonPrice(item, itemPrice)
        selectedOptions.push({ label: g.label, value: item.title })
      }
    }

    return { itemPrice, addonsTotal, subtotal: itemPrice + addonsTotal, selectedOptions }
  }, [groups, basePrice, state])

  return {
    state,
    ...derived,
    choose: (groupId: string, valueId: string) => dispatch({ type: 'choose', groupId, valueId }),
    setText: (groupId: string, value: string) => dispatch({ type: 'text', groupId, value }),
    toggleAddon: (groupId: string, itemId: string) => dispatch({ type: 'toggle-addon', groupId, itemId }),
  }
}

export type ProductOptionsController = ReturnType<typeof useProductOptions>
