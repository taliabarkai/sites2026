'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders overlay chrome at document.body.
 *
 * Both panels are position:fixed but mount deep inside the page tree, where an
 * ancestor stacking context can paint the site header above them regardless of
 * z-index. Portalling to the body sidesteps that entirely.
 */
export function PanelPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Theme tokens are scoped to the [data-theme] wrapper (app/[brand]/layout.tsx).
    // Portal there rather than to <body>, or the panel renders outside the theme
    // and every var — colours, radii, --transition-base — silently falls back.
    setTarget(document.querySelector<HTMLElement>('[data-theme]') ?? document.body)
  }, [])

  if (!target) return null
  return createPortal(children, target)
}
