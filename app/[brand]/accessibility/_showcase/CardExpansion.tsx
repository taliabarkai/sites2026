'use client'

import { createContext, useContext } from 'react'

// "Expand all" / "Collapse all" for the component cards. Each press bumps
// `signal`, and every card follows `open` once; a card can still be toggled
// on its own afterwards.

export interface CardExpansion {
  signal: number
  open: boolean
}

const CardExpansionContext = createContext<CardExpansion>({ signal: 0, open: false })

export const CardExpansionProvider = CardExpansionContext.Provider

export function useCardExpansion() {
  return useContext(CardExpansionContext)
}

// Heading level for card titles: 3 inside a section heading, 2 when the page
// lists cards directly. Block titles inside a card sit one level below.
const CardHeadingLevelContext = createContext<2 | 3>(3)

export const CardHeadingLevelProvider = CardHeadingLevelContext.Provider

export function useCardHeadingLevel() {
  return useContext(CardHeadingLevelContext)
}
