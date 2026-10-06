'use client'

import { createContext, useContext } from 'react'
import tokens from './proposed-tokens.module.css'

// Which version of every demo the page shows: production today ("before") or
// the proposed fix ("after"). Set once, from the top bar, for the whole page.

export type ShowcaseView = 'before' | 'after'

const ShowcaseViewContext = createContext<ShowcaseView>('after')

export const ShowcaseViewProvider = ShowcaseViewContext.Provider

export function useShowcaseView() {
  const view = useContext(ShowcaseViewContext)
  const isAfter = view === 'after'

  return {
    view,
    isAfter,
    /** The token scope for a demo region: proposed values, or today's. */
    scope: isAfter ? tokens.after : tokens.before,
    /** A per-type focus treatment — only part of the fix, so only in After. */
    ring: (className: string) => (isAfter ? className : ''),
  }
}
