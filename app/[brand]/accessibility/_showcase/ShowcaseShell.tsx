'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { BrandKey } from '../../_config/brands'
import { Button } from '../../_components/Button'
import styles from '../accessibility.module.css'
import { CardExpansionProvider, CardHeadingLevelProvider, type CardExpansion } from './CardExpansion'
import tokens from './proposed-tokens.module.css'
import type { ShowcaseSection as ShowcaseSectionConfig } from './sections'
import { ShowcaseSection } from './ShowcaseSection/ShowcaseSection'
import { ShowcaseTopBar } from './ShowcaseTopBar'
import { ShowcaseViewProvider, type ShowcaseView } from './ShowcaseView'

export interface ShowcaseShellProps {
  brand: BrandKey
  /** The route after the brand, e.g. "accessibility" — brand links keep it. */
  path: string
  /** Shown in the top bar and as the h1. */
  title: string
  lead: string
  sections: ShowcaseSectionConfig[]
  cards: Record<string, ReactNode>
  /** false: no collapsible section headings — each entry is one card, listed directly. */
  sectionHeadings?: boolean
  /** Show the Expand all / Collapse all buttons under the contents. */
  expandControls?: boolean
}

/**
 * The page frame shared by the accessibility pages: skip link, top bar
 * (brand, Before / After, show all focus states), intro, contents, collapsible
 * sections and footer.
 */
export function ShowcaseShell({ brand, path, title, lead, sections, cards, sectionHeadings = true, expandControls = true }: ShowcaseShellProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLElement>(null)
  const [forceFocus, setForceFocus] = useState(false)
  const [view, setView] = useState<ShowcaseView>('after')
  const [expansion, setExpansion] = useState<CardExpansion>({ signal: 0, open: false })
  const expandAll = (open: boolean) => setExpansion((current) => ({ signal: current.signal + 1, open }))

  // The view lives in the URL (?view=before) so it survives a brand switch and
  // can be linked to. Read after mount to keep the page statically rendered.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'before') setView('before')
  }, [])

  const changeView = (next: ShowcaseView) => {
    setView(next)
    const url = new URL(window.location.href)
    if (next === 'before') url.searchParams.set('view', 'before')
    else url.searchParams.delete('view')
    window.history.replaceState(null, '', url)
  }

  // 2.4.11 Focus Not Obscured: track the sticky bar's height (it wraps on
  // small screens) so scroll-margin-top keeps focused elements below it.
  useEffect(() => {
    const bar = topBarRef.current
    const root = rootRef.current
    if (!bar || !root) return

    const observer = new ResizeObserver(([entry]) => {
      root.style.setProperty('--a11y-topbar-height', `${entry.borderBoxSize[0].blockSize}px`)
    })
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  return (
    <ShowcaseViewProvider value={view}>
      <CardExpansionProvider value={expansion}>
        <div ref={rootRef} className={`${tokens.scope} ${styles.page}`} data-force-focus={forceFocus}>
          <a href="#main-content" className={styles.skipLink}>
            Skip to content
          </a>

          <ShowcaseTopBar
            ref={topBarRef}
            brand={brand}
            path={path}
            name={title}
            view={view}
            onViewChange={changeView}
            forceFocus={forceFocus}
            onForceFocusChange={setForceFocus}
          />

          <main id="main-content" tabIndex={-1} className={styles.main}>
            <div className={styles.container}>
              <div className={styles.intro}>
                <h1 className={styles.pageTitle}>{title}</h1>
                <p className={styles.lead}>{lead}</p>
                <p className={styles.note} aria-live="polite">
                  {view === 'after' ? (
                    <>
                      <strong>Showing After:</strong>{' '}the proposed fixes. They apply on this page only; nothing
                      else on the site changes until they&rsquo;re approved. Switch to Before in the top bar to
                      see production as it is today.
                    </>
                  ) : (
                    <>
                      <strong>Showing Before:</strong>{' '}production as it is today. Switch to After in the top
                      bar to see the proposed fixes.
                    </>
                  )}
                </p>
              </div>

              <nav aria-label="On this page" className={styles.toc}>
                <h2 className={styles.tocTitle}>On this page</h2>
                <ol className={styles.tocList}>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className={`${styles.tocLink} ${tokens.ringLink}`}>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
                {expandControls && (
                  <div className={styles.expandControls}>
                    <Button variant="secondary" size="compact" onClick={() => expandAll(true)}>
                      Expand all
                    </Button>
                    <Button variant="secondary" size="compact" onClick={() => expandAll(false)}>
                      Collapse all
                    </Button>
                  </div>
                )}
              </nav>

              {sectionHeadings ? (
                sections.map((section) => (
                  <ShowcaseSection key={section.id} id={section.id} title={section.title} intro={section.intro}>
                    {cards[section.id]}

                    {section.planned.length > 0 && (
                      <div className={styles.planned}>
                        <p className={styles.plannedTitle}>Coming next</p>
                        <ul className={styles.plannedList}>
                          {section.planned.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </ShowcaseSection>
                ))
              ) : (
                // Cards straight under the h1, so their titles become h2
                <CardHeadingLevelProvider value={2}>
                  <div className={styles.cards}>
                    {sections.map((section) => (
                      <div key={section.id}>{cards[section.id]}</div>
                    ))}
                  </div>
                </CardHeadingLevelProvider>
              )}
            </div>
          </main>

          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <p className={styles.footerText}>
                Proposed tokens live in <code>accessibility/_showcase/proposed-tokens.module.css</code> and
                apply to this page only.
              </p>
              <a href="#main-content" className={`${styles.footerLink} ${tokens.ringLink}`}>
                Back to top
              </a>
            </div>
          </footer>
        </div>
      </CardExpansionProvider>
    </ShowcaseViewProvider>
  )
}
