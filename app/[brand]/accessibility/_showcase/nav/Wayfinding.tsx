'use client'

import { useState } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './nav.module.css'

// ─── Breadcrumbs ───────────────────────────────────────────────────────────

/**
 * nav + aria-label, an ordered list, and the current page as plain text with
 * aria-current="page". Separators are decoration, hidden from screen readers.
 */
export function Breadcrumbs({ trail, current }: { trail: { label: string; href: string }[]; current: string }) {
  const { ChevronIcon } = useBrandIcons()
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumbs}>
        {trail.map((crumb) => (
          <li key={crumb.label} className={styles.crumb}>
            <a href={crumb.href} className={`${styles.crumbLink} ${tokens.ringLink}`}>
              {crumb.label}
            </a>
            <span className={styles.crumbSeparator} aria-hidden="true">
              <ChevronIcon className={styles.separatorIcon} />
            </span>
          </li>
        ))}
        <li className={styles.crumb}>
          <span aria-current="page" className={styles.crumbCurrent}>
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────

/** Page numbers to show: first, last, current ± 1, with gaps between. */
function pageList(current: number, total: number): (number | 'gap')[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? (['gap', page] as const) : [page]))
}

/**
 * Links, because each page is a place. The current page is a filled, bold
 * box with aria-current; Previous and Next are named in words, and turn into
 * plain text — not dead links — at either end.
 */
export function Pagination({ total, defaultPage = 1, demoFocusPage }: { total: number; defaultPage?: number; demoFocusPage?: number }) {
  const { ChevronIcon } = useBrandIcons()
  const [page, setPage] = useState(defaultPage)

  const link = (target: number, label: string, content: React.ReactNode, extra = '') => (
    <a
      href={`?page=${target}#pagination`}
      aria-label={label}
      aria-current={target === page && !extra ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault()
        setPage(target)
      }}
      className={`${styles.pageLink} ${extra}`}
    >
      {content}
    </a>
  )

  return (
    <nav aria-label="Pagination">
      <ul className={styles.pages}>
        <li>
          {page > 1 ? (
            link(page - 1, 'Previous page', <><span className={styles.prevIcon} aria-hidden="true"><ChevronIcon className={styles.icon} /></span>Previous</>, styles.pageStep)
          ) : (
            <span className={`${styles.pageLink} ${styles.pageStep} ${styles.pageStepOff}`} aria-hidden="true">
              <span className={styles.prevIcon}><ChevronIcon className={styles.icon} /></span>Previous
            </span>
          )}
        </li>
        {pageList(page, total).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className={styles.pageGap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item} className={demoFocusPage === item ? tokens.forceFocus : undefined}>
              {link(item, `Page ${item}`, item)}
            </li>
          ),
        )}
        <li>
          {page < total ? (
            link(page + 1, 'Next page', <>Next<span aria-hidden="true"><ChevronIcon className={styles.icon} /></span></>, styles.pageStep)
          ) : (
            <span className={`${styles.pageLink} ${styles.pageStep} ${styles.pageStepOff}`} aria-hidden="true">
              Next<ChevronIcon className={styles.icon} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
