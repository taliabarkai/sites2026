'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useCardExpansion, useCardHeadingLevel } from '../CardExpansion'
import { useSection } from '../ShowcaseSection/ShowcaseSection'
import tokens from '../proposed-tokens.module.css'
import { useShowcaseView } from '../ShowcaseView'
import { useBrandIcons } from '../useBrandIcons'
import styles from './ShowcaseCard.module.css'

export interface ShowcaseState {
  label: string
  content: ReactNode
}

export interface ShowcaseCardProps {
  id: string
  title: string
  /** WCAG success criteria, e.g. "2.4.7 Focus Visible" */
  criteria: string[]
  /** One line on what each view shows, swapped with the top bar's toggle. */
  notes: { before: string; after: string }
  dos: string[]
  donts: string[]
  /** The live, interactive component, in whichever view the page is showing. */
  children: ReactNode
  /** Static copies of the component in each state. Inert: not focusable. */
  states?: ShowcaseState[]
}

export function ShowcaseCard({ id, title, criteria, notes, dos, donts, children, states }: ShowcaseCardProps) {
  const { isAfter, scope } = useShowcaseView()
  const { ChevronIcon } = useBrandIcons()
  const expansion = useCardExpansion()
  const level = useCardHeadingLevel()
  const Title = level === 2 ? 'h2' : 'h3'
  const Block = level === 2 ? 'h3' : 'h4'
  const [open, setOpen] = useState(false)
  const headingId = `${id}-heading`
  const bodyId = `${id}-body`

  // Expand all / Collapse all
  useEffect(() => {
    if (expansion.signal) setOpen(expansion.open)
  }, [expansion.signal, expansion.open])

  // A link straight to this card (#text-field) opens it, and its section
  const { reveal } = useSection()
  useEffect(() => {
    const openIfTarget = () => {
      if (window.location.hash !== `#${id}`) return
      reveal()
      setOpen(true)
      // It was hidden when the browser tried to scroll to it
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    }
    openIfTarget()
    window.addEventListener('hashchange', openIfTarget)
    return () => window.removeEventListener('hashchange', openIfTarget)
  }, [id, reveal])

  return (
    <article id={id} className={styles.card} aria-labelledby={headingId}>
      <header className={styles.header}>
        {/* A disclosure: the heading holds a button, so it's still listed as a heading */}
        <Title className={styles.title}>
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
        </Title>
        <ul className={styles.criteria} aria-label="WCAG criteria">
          {criteria.map((criterion) => (
            <li key={criterion} className={styles.criterion}>
              {criterion}
            </li>
          ))}
        </ul>
      </header>

      {/* Mounted only while open, so collapsed demos (the carousel's timer, the
          drawers) don't run in the background */}
      <div id={bodyId} hidden={!open} className={styles.body}>
        {open && (
          <>
            <div className={styles.block}>
              <Block className={styles.blockTitle}>Try it</Block>
              <p className={styles.viewNote}>
                <span className={styles.viewLabel}>{isAfter ? 'After' : 'Before'}</span>{' '}
                {isAfter ? notes.after : notes.before}
              </p>
              <div className={`${scope} ${tokens.demo} ${styles.live}`}>{children}</div>
            </div>

            {states && states.length > 0 && (
              <div className={styles.block}>
                <Block className={styles.blockTitle}>States</Block>
                {!isAfter && <p className={styles.viewNote}>The states show the proposed component. Switch to After to see them.</p>}
                {/* Static copies for review: inert keeps them out of the tab order,
                    and each one is named by its visible label. */}
                {isAfter && (
                  <ul className={`${scope} ${styles.states}`} inert>
                    {states.map((state) => (
                      <li key={state.label} className={styles.state}>
                        <span className={styles.stateLabel}>{state.label}</span>
                        <div className={styles.stateBody}>{state.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className={styles.guidance}>
              <div className={styles.guidanceColumn}>
                <Block className={styles.blockTitle}>Do</Block>
                <ul className={styles.guidanceList}>
                  {dos.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.guidanceColumn}>
                <Block className={styles.blockTitle}>Don&rsquo;t</Block>
                <ul className={styles.guidanceList}>
                  {donts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  )
}
