'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useCardExpansion } from '../CardExpansion'
import { useBrandIcons } from '../useBrandIcons'
import styles from './ShowcaseSection.module.css'

// Lets a card inside open its section — for a link straight to the card.
const SectionContext = createContext<{ reveal: () => void }>({ reveal: () => {} })

export function useSection() {
  return useContext(SectionContext)
}

interface ShowcaseSectionProps {
  id: string
  title: string
  intro: string
  children: ReactNode
}

/**
 * A page section that starts collapsed. Same disclosure as the cards: an h2
 * holding a button, with a chevron in front that points right when closed and
 * turns down when open. The intro stays visible, so a collapsed page still
 * reads as a table of contents.
 *
 * The body stays mounted while hidden — cards are closed and light — so a card
 * can still notice a link to itself and open the section around it.
 */
export function ShowcaseSection({ id, title, intro, children }: ShowcaseSectionProps) {
  const { ChevronIcon } = useBrandIcons()
  const expansion = useCardExpansion()
  const [open, setOpen] = useState(false)
  const headingId = `${id}-title`
  const bodyId = `${id}-body`
  // Stable, so a card's effect that depends on it doesn't re-run every render
  const context = useMemo(() => ({ reveal: () => setOpen(true) }), [])

  // Expand all / Collapse all
  useEffect(() => {
    if (expansion.signal) setOpen(expansion.open)
  }, [expansion.signal, expansion.open])

  // A link to the section (the contents list) opens it
  useEffect(() => {
    const openIfTarget = () => {
      if (window.location.hash === `#${id}`) setOpen(true)
    }
    openIfTarget()
    window.addEventListener('hashchange', openIfTarget)
    return () => window.removeEventListener('hashchange', openIfTarget)
  }, [id])

  return (
    <SectionContext.Provider value={context}>
      <section id={id} aria-labelledby={headingId} className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <button
              id={headingId}
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => setOpen((value) => !value)}
              className={styles.toggle}
            >
              <span className={`${styles.toggleIcon} ${open ? styles.toggleIconOpen : ''}`} aria-hidden="true">
                <ChevronIcon className={styles.chevron} />
              </span>
              <span>{title}</span>
            </button>
          </h2>
          <p className={styles.intro}>{intro}</p>
        </div>
        <div id={bodyId} hidden={!open} className={styles.body}>
          {children}
        </div>
      </section>
    </SectionContext.Provider>
  )
}
