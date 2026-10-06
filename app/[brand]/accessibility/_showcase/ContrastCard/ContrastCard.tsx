'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import {
  CONTRAST_GROUPS,
  REQUIRED_RATIO,
  contrastRatio,
  resolveColor,
  toHex,
  type ContrastPair,
} from '../contrast'
import styles from './ContrastCard.module.css'

interface Row extends ContrastPair {
  fg: string | null
  bg: string | null
  ratio: number | null
  passes: boolean | null
}

function useContrastRows(probeRef: React.RefObject<HTMLSpanElement | null>, view: string) {
  const [groups, setGroups] = useState<{ title: string; rows: Row[] }[]>([])

  // Re-measure whenever the view flips: the same variable names resolve to
  // today's values in Before and the proposed ones in After.
  useLayoutEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    setGroups(
      CONTRAST_GROUPS.map((group) => ({
        title: group.title,
        rows: group.pairs.map((pair) => {
          const fg = resolveColor(probe, pair.foreground)
          const bg = resolveColor(probe, pair.background)
          const ratio = fg && bg ? contrastRatio(fg, bg) : null
          return {
            ...pair,
            fg: fg && toHex(fg),
            bg: bg && toHex(bg),
            ratio,
            passes: ratio === null ? null : ratio >= REQUIRED_RATIO[pair.kind],
          }
        }),
      })),
    )
  }, [probeRef, view])

  return groups
}

function Sample({ row }: { row: Row }) {
  if (row.kind === 'ui') {
    return (
      <span className={styles.sample} style={{ background: `var(${row.background})` }} aria-hidden="true">
        <span className={styles.sampleLine} style={{ borderColor: `var(${row.foreground})` }} />
      </span>
    )
  }
  return (
    <span
      className={styles.sample}
      style={{ background: `var(${row.background})`, color: `var(${row.foreground})` }}
      aria-hidden="true"
    >
      Aa
    </span>
  )
}

function ContrastTables() {
  const { view } = useShowcaseView()
  const probeRef = useRef<HTMLSpanElement>(null)
  const groups = useContrastRows(probeRef, view)

  const rows = groups.flatMap((group) => group.rows).filter((row) => row.passes !== null)
  const passing = rows.filter((row) => row.passes).length

  return (
    <div className={styles.tables}>
      <span ref={probeRef} className={styles.probe} aria-hidden="true" />

      <p className={styles.summary} aria-live="polite">
        {rows.length > 0 && (
          <>
            <strong>
              {passing} of {rows.length} pairs pass
            </strong>{' '}
            in this brand. Text needs 4.5:1; borders and focus rings need 3:1.
          </>
        )}
      </p>

      {groups.map((group) => (
        // A data table may scroll sideways on a phone (1.4.10 exception); the
        // region is focusable so keyboard users can scroll it too.
        <div
          key={group.title}
          className={styles.scroller}
          role="region"
          aria-label={`${group.title} contrast, scrolls sideways`}
          tabIndex={0}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>{group.title}</caption>
            <colgroup>
              <col className={styles.colPair} />
              <col className={styles.colSample} />
              <col className={styles.colColors} />
              <col className={styles.colRatio} />
              <col className={styles.colNeeds} />
              <col className={styles.colResult} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Pair</th>
                <th scope="col">Sample</th>
                <th scope="col">Colors</th>
                <th scope="col">Ratio</th>
                <th scope="col">Needs</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className={styles.pair}>
                    {row.label}
                    <span className={styles.tokens}>
                      {row.foreground} on {row.background}
                    </span>
                  </th>
                  <td>
                    <Sample row={row} />
                  </td>
                  <td className={styles.hex}>{row.fg && row.bg ? `${row.fg} / ${row.bg}` : '—'}</td>
                  <td className={styles.ratio}>{row.ratio === null ? '—' : `${row.ratio.toFixed(2)}:1`}</td>
                  <td>{REQUIRED_RATIO[row.kind]}:1</td>
                  <td>
                    {row.passes === null ? (
                      <span className={styles.na}>Not set</span>
                    ) : (
                      <span className={row.passes ? styles.pass : styles.fail}>
                        {row.passes ? 'Pass' : 'Fail'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export function ContrastCard() {
  return (
    <ShowcaseCard
      id="color-contrast"
      title="Color contrast"
      criteria={['1.4.3 Contrast (Minimum)', '1.4.11 Non-text Contrast']}
      notes={{
        before: "Today's theme values, measured live from the CSS variables.",
        after: 'With the proposed fixes, measured live from the CSS variables.',
      }}
      dos={[
        'Check every new text and background pair against 4.5:1 before it ships.',
        'Give borders that identify a control, like swatches and fields, 3:1.',
        'Switch brand in the top bar to check each theme.',
      ]}
      donts={[
        "Don't use secondary grey for anything a customer has to read, like prices or errors.",
        "Don't rely on a light hairline border to show where a control is.",
        "Don't hardcode a ratio in docs; it drifts when the theme changes.",
      ]}
    >
      <ContrastTables />
    </ShowcaseCard>
  )
}
