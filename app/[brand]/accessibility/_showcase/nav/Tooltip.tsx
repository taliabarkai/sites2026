'use client'

import { useEffect, useId, useState } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './nav.module.css'

/**
 * 1.4.13 Content on Hover or Focus:
 *   - appears on hover and on keyboard focus
 *   - dismissable: Escape hides it without moving focus
 *   - hoverable: the pointer can move onto the tooltip without it vanishing
 *   - persistent: stays until hover / focus leaves, or Escape
 * The trigger names what it explains; the tip is linked with aria-describedby.
 */
export function Tooltip({ term, tip, demoOpen }: { term: string; tip: string; demoOpen?: boolean }) {
  const id = useId()
  const { TooltipIcon } = useBrandIcons()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const open = demoOpen || ((hovered || focused) && !dismissed)

  useEffect(() => {
    if (!open || demoOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, demoOpen])

  return (
    // The wrapper holds hover, so moving from the button onto the tip keeps it open
    <span
      className={`${styles.tooltipWrap} ${demoOpen ? tokens.forceFocus : ''}`}
      onMouseEnter={() => {
        setHovered(true)
        setDismissed(false)
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-describedby={`${id}-tip`}
        aria-label={`About ${term}`}
        onFocus={() => {
          setFocused(true)
          setDismissed(false)
        }}
        onBlur={() => setFocused(false)}
        className={styles.tooltipTrigger}
      >
        <TooltipIcon className={styles.icon} />
      </button>
      {/* Always in the DOM so aria-describedby resolves; hidden visually when closed */}
      <span id={`${id}-tip`} role="tooltip" className={`${styles.tooltip} ${open ? styles.tooltipOpen : ''}`}>
        {tip}
      </span>
    </span>
  )
}
