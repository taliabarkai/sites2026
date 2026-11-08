'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { TextInputGroup } from './types'
import { useOptionIcons } from './useOptionIcons'
import { useDropDirection } from './useDropDirection'
import styles from './ProductOptions.module.css'
import kb from './LetterKeyboard.module.css'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * A one-letter text field picked from a keyboard: it looks like the page's
 * dropdowns, and opening it drops a QWERTY grid of letters under it. The value
 * is still text, so the cart and the preview read it like a typed one.
 *
 *   Trigger    click / Enter / Space / ↓ open it; typing a letter picks it straight away
 *   Keyboard   click or Enter on a key picks it and closes; typing a letter does too;
 *              Escape, Tab out or a click outside closes
 */
export function LetterKeyboard({
  group,
  value,
  onChange,
  children,
}: {
  group: TextInputGroup
  value: string
  onChange: (value: string) => void
  /** Rendered under the field (the page's error line). */
  children?: ReactNode
}) {
  const id = useId()
  const labelId = `${id}-label`
  const keysId = `${id}-keys`
  const { DropdownIcon } = useOptionIcons()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const keysRef = useRef<HTMLDivElement>(null)
  const letter = value.trim().toUpperCase()

  // Opens up or down to fit, never moving the page; lands on the picked letter
  const dir = useDropDirection(open, triggerRef, keysRef)
  useEffect(() => {
    if (!open) return
    const on = keysRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') ?? keysRef.current?.querySelector('button')
    on?.focus({ preventScroll: true })
  }, [open])

  // A click anywhere outside closes it
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const pick = (l: string) => {
    onChange(l)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const typedLetter = (e: KeyboardEvent) => (/^[a-z]$/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey ? e.key.toUpperCase() : null)

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const l = typedLetter(e)
    if (l) { e.preventDefault(); onChange(l); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
  }

  const onKeysKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const l = typedLetter(e)
    if (l) { e.preventDefault(); pick(l); return }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div className={styles.group}>
      <p id={labelId} className={styles.groupLabel}>{group.label}</p>
      <div
        ref={rootRef}
        className={styles.dropdown}
        // Tabbing past the last key closes it
        onBlur={(e) => { if (open && !rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false) }}
      >
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${open ? (dir === 'up' ? styles.triggerOpenUp : styles.triggerOpen) : ''}`}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={open ? keysId : undefined}
          aria-labelledby={`${labelId} ${id}-value`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span id={`${id}-value`} className={`${styles.triggerValue} ${letter ? '' : kb.placeholder}`}>
            {letter || 'Select a letter'}
          </span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
            <DropdownIcon size={24} />
          </span>
        </button>

        {open && (
          <div ref={keysRef} id={keysId} role="group" aria-labelledby={labelId} className={`${styles.list} ${kb.keyboard} ${dir === 'up' ? styles.listUp : ''}`} onKeyDown={onKeysKeyDown}>
            {LETTERS.map((l) => (
              <button
                key={l}
                type="button"
                className={`${kb.key} ${l === letter ? kb.keySelected : ''}`}
                aria-pressed={l === letter}
                onClick={() => pick(l)}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
