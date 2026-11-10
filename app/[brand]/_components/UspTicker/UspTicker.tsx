'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './UspTicker.module.css'

type IconCmp = React.ComponentType<{ size?: number; className?: string }>

export interface UspMessage {
  Icon?: IconCmp
  /** Bold lead ("Free preview") */
  lead: string
  /** Regular rest of the line ("in 24 hours") */
  rest?: string
}

export type UspTickerMode = 'rotate' | 'marquee'

interface UspTickerProps {
  messages: UspMessage[]
  mode?: UspTickerMode
  /** Rotate mode: time each message stays up */
  intervalMs?: number
  /** Rotate mode: dots under the message to show / pick the current one */
  dots?: boolean
  label?: string
}

/**
 * One-line USP strip that cycles its messages so none are missed.
 *  • rotate  — one message at a time (icon left, text on one row), advancing
 *              on its own (5s default); optional dots below to jump; pauses on
 *              hover/focus; swipe on touch
 *  • marquee — all messages scroll slowly in a continuous row; pauses on hover
 * Reduced motion: rotate still steps but without the slide; marquee becomes a
 * static, wrapping row.
 */
export function UspTicker({ messages, mode = 'rotate', intervalMs = 5000, dots = true, label = 'Why order with us' }: UspTickerProps) {
  return mode === 'marquee'
    ? <Marquee messages={messages} label={label} />
    : <Rotator messages={messages} intervalMs={intervalMs} dots={dots} label={label} />
}

function MessageRow({ Icon, lead, rest }: UspMessage) {
  return (
    <span className={styles.message}>
      {Icon && <span className={styles.icon} aria-hidden="true"><Icon size={24} /></span>}
      <span className={styles.text}>
        <span className={styles.lead}>{lead}</span>
        {rest && <> <span className={styles.rest}>{rest}</span></>}
      </span>
    </span>
  )
}

function Rotator({ messages, intervalMs, dots, label }: { messages: UspMessage[]; intervalMs: number; dots: boolean; label: string }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = messages.length

  useEffect(() => {
    if (paused || count < 2) return
    const id = window.setTimeout(() => setActive(i => (i + 1) % count), intervalMs)
    return () => window.clearTimeout(id)
    // Restarting on `active` gives a dot click a full interval before moving on
  }, [active, paused, count, intervalMs])

  const go = (i: number) => setActive(((i % count) + count) % count)

  return (
    <section
      className={styles.strip}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 30) go(active + (dx < 0 ? 1 : -1))
      }}
    >
      <div className={styles.viewport} aria-live={paused ? 'polite' : 'off'}>
        {messages.map((m, i) => (
          <div
            key={m.lead}
            className={`${styles.slide} ${i === active ? styles.slideActive : ''} ${i === (active - 1 + count) % count ? styles.slidePrev : ''}`}
            aria-hidden={i !== active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <MessageRow {...m} />
          </div>
        ))}
      </div>
      {dots && count > 1 && (
        <div className={styles.dots}>
          {messages.map((m, i) => (
            <button
              key={m.lead}
              type="button"
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              aria-label={`Show message ${i + 1} of ${count}: ${m.lead}`}
              aria-current={i === active}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Marquee({ messages, label }: { messages: UspMessage[]; label: string }) {
  // Two copies side by side; the track slides by exactly one copy and loops
  const run = (hidden: boolean) => (
    <ul className={styles.marqueeRun} aria-hidden={hidden || undefined}>
      {messages.map(m => (
        <li key={m.lead} className={styles.marqueeItem}>
          <MessageRow {...m} />
          <span className={styles.separator} aria-hidden="true" />
        </li>
      ))}
    </ul>
  )
  return (
    <section className={`${styles.strip} ${styles.marqueeStrip}`} aria-label={label}>
      <div className={styles.marqueeTrack}>
        {run(false)}
        {run(true)}
      </div>
    </section>
  )
}
