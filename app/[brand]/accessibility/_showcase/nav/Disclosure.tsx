'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './nav.module.css'

// ─── Accordion ─────────────────────────────────────────────────────────────

export interface AccordionItem {
  title: string
  content: ReactNode
}

/**
 * Each header is a real <button> inside a heading, so it's reachable by Tab
 * and listed by heading navigation. aria-expanded says open or closed;
 * aria-controls points at the panel. Panels open independently.
 */
export function Accordion({ items, defaultOpen = [], demoFocusIndex }: { items: AccordionItem[]; defaultOpen?: number[]; demoFocusIndex?: number }) {
  const id = useId()
  const { ChevronIcon } = useBrandIcons()
  const [open, setOpen] = useState<number[]>(defaultOpen)

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const expanded = open.includes(index)
        const buttonId = `${id}-button-${index}`
        const panelId = `${id}-panel-${index}`
        return (
          <div key={item.title} className={`${styles.accordionItem} ${demoFocusIndex === index ? tokens.forceFocus : ''}`}>
            <h5 className={styles.accordionHeading}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen((current) => (expanded ? current.filter((i) => i !== index) : [...current, index]))}
                className={styles.accordionButton}
              >
                <span>{item.title}</span>
                <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`} aria-hidden="true">
                  <ChevronIcon className={styles.icon} />
                </span>
              </button>
            </h5>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className={styles.accordionPanel}>
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

export interface TabItem {
  label: string
  content: ReactNode
}

/**
 * The ARIA tabs pattern: one tab stop for the tab list, Left / Right to move
 * (and show — automatic activation), Home / End to jump, Tab into the panel.
 * The selected tab is underlined and bold, so focus is the box ring — never
 * an underline here.
 */
export function Tabs({ label, items, demoFocusIndex }: { label: string; items: TabItem[]; demoFocusIndex?: number }) {
  const id = useId()
  const [selected, setSelected] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number) => {
    const next = (index + items.length) % items.length
    setSelected(next)
    refs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: selected + 1,
      ArrowLeft: selected - 1,
      Home: 0,
      End: items.length - 1,
    }
    if (event.key in keys) {
      event.preventDefault()
      select(keys[event.key])
    }
  }

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.tabList}>
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={(el) => {
              refs.current[index] = el
            }}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={onKeyDown}
            className={`${styles.tab} ${demoFocusIndex === index ? styles.tabDemoFocus : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.label}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          hidden={index !== selected}
          className={styles.tabPanel}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
