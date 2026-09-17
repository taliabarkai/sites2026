'use client'

import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { getBrandFromPathname } from '../../_config/brands'
import { PanelPortal } from '../PanelPortal'
import { lookupReply } from './hebrewNames'
import styles from './TranslationAdvisor.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib:  ibIcons,
} as const

const MAX_QUERY_LENGTH = 120

/**
 * v1 — floating pill launcher; a corner window on desktop, a sheet on mobile.
 * v2 — inline card under the engrave field, collapsed behind a text toggle.
 * v3 — v2's inline text link (no chevron) opening v1's floating popup.
 */
export type TranslationAdvisorVariant = 'inline' | 'floating' | 'link'

type Entry =
  | { role: 'you';     text: string }
  | { role: 'advisor'; text: string; hebrew?: string; name?: string }

export interface TranslationAdvisorProps {
  variant?: TranslationAdvisorVariant
  toggleLabel?: string
  /** Centred header above the conversation. */
  chatTitle?: string
  chatSubtitle?: string
  /** First bubble in the thread; stays put once the shopper replies. */
  greeting?: string
  placeholder?: string
  /** Accessible name for the field — the placeholder is an example, not a label. */
  inputLabel?: string
  /** Pill label on the v1 floating launcher. */
  launcherLabel?: string
  /** Receives the Hebrew spelling when the shopper accepts a suggestion. */
  onUseName?: (hebrew: string) => void
  onAsk?: (query: string) => void
}

/**
 * Inline "Translation Advisor" chat card.
 *
 * Copy defaults are Hebrew-specific because Israel Blessing is the only brand
 * rendering it today, but every string is overridable and every colour comes
 * from a theme token, so another brand can adopt it without a fork.
 */
export function TranslationAdvisor({
  variant = 'inline',
  toggleLabel = 'Need help with Hebrew? Ask our AI translator',
  chatTitle = 'Need help with Hebrew?',
  chatSubtitle = 'Ask our AI Translation Advisor',
  greeting = 'I can help with spelling, engravings and meanings.',
  placeholder = 'e.g. "How do you write Sarah in Hebrew?"',
  inputLabel = 'Ask about Hebrew names and engravings',
  launcherLabel = 'Translate with AI',
  onUseName,
  onAsk,
}: TranslationAdvisorProps = {}) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const { AiSparkleIcon, ArrowIcon, ChevronIcon, XIcon } = BRAND_ICONS[brand]

  const [open, setOpen]     = useState(false)
  const [query, setQuery]   = useState('')
  const [thread, setThread] = useState<Entry[]>(() => [{ role: 'advisor', text: greeting }])
  const [copied, setCopied] = useState<string | null>(null)

  const panelId = useId()
  const inputId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)
  const threadRef   = useRef<HTMLUListElement>(null)

  const isFloating = variant === 'floating'
  const isLink     = variant === 'link'
  /** Both v1 and v3 present the chat as an overlay rather than in the flow. */
  const isOverlay  = isFloating || isLink

  // Escape closes the floating window; the inline card is not a dialog.
  useEffect(() => {
    if (!isOverlay || !open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); launcherRef.current?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOverlay, open])

  // Clicking away closes it. The scrim only covers mobile, so desktop needs a
  // real outside-click test. The launcher is excluded because its own handler
  // toggles — closing here first would let it reopen on the same click.
  useEffect(() => {
    if (!isOverlay || !open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (launcherRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOverlay, open])

  // Keep the newest reply in view.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q === '') return
    const reply = lookupReply(q)
    setThread(prev => [...prev, { role: 'you', text: q }, { role: 'advisor', ...reply }])
    onAsk?.(q)
    setQuery('')
  }

  /** The label promises the clipboard, so that is all this does. */
  const handleCopyName = async (hebrew: string) => {
    try {
      await navigator.clipboard.writeText(hebrew)
      setCopied(hebrew)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard can be blocked by permissions; leave the label unchanged
      // rather than claiming a copy that did not happen.
    }
  }

  /**
   * Currently unreferenced: the result bubble's action copies the spelling
   * rather than pushing it into the engrave field. Kept because `onUseName` is
   * still the component's public hook and the product page passes it — decide
   * whether the design wants both actions before removing it.
   */
  const handleUseName = (hebrew: string) => {
    onUseName?.(hebrew)
    // Close the overlay so the filled field is visible behind it.
    if (isOverlay) { setOpen(false); launcherRef.current?.focus() }
  }

  const conversation = (
    <div className={styles.conversation}>
      <div className={`flex flex-col items-center ${styles.chatHeader}`}>
        <span className={`flex items-center justify-center ${styles.chatAvatar}`} aria-hidden="true">
          <AiSparkleIcon size={24} />
        </span>
        <p className={styles.chatTitle}>{chatTitle}</p>
        <p className={styles.chatSubtitle}>{chatSubtitle}</p>
      </div>

      <ul ref={threadRef} className={`flex flex-col gap-2 ${styles.thread}`}>
        {thread.map((entry, i) => (
          <Fragment key={i}>
            <li className={entry.role === 'you' ? styles.rowYou : styles.rowAdvisor}>
              <div className={`${styles.bubble} ${entry.role === 'you' ? styles.bubbleYou : styles.bubbleAdvisor}`}>
                {entry.role === 'advisor' && (
                  <span className={styles.bubbleAvatar} aria-hidden="true">
                    <AiSparkleIcon size={20} />
                  </span>
                )}
                <span className={styles.bubbleText}>{entry.text}</span>
              </div>
            </li>

            {/* The spelling gets its own bubble so the Hebrew can be shown at a
                size worth reading, with the action attached to it. */}
            {entry.role === 'advisor' && entry.hebrew && (
              <li className={styles.rowAdvisor}>
                <div className={`${styles.bubble} ${styles.bubbleAdvisor}`}>
                  <span className={styles.bubbleAvatar} aria-hidden="true">
                    <AiSparkleIcon size={20} />
                  </span>
                  <span className={styles.resultBody}>
                    <span className={styles.resultHebrew} lang="he" dir="rtl">{entry.hebrew}</span>
                    <button
                      type="button"
                      className={styles.copyName}
                      onClick={() => handleCopyName(entry.hebrew!)}
                    >
                      {copied === entry.hebrew ? 'Copied' : 'Copy Hebrew Name'}
                    </button>
                  </span>
                </div>
              </li>
            )}
          </Fragment>
        ))}
      </ul>
    </div>
  )

  /* Its own surface, pinned below the conversation, so the field stays put */
  const composer = (
    <div className={styles.composer}>
      <form className={`relative w-full ${styles.field}`} onSubmit={handleSubmit}>
        <label className={styles.visuallyHidden} htmlFor={inputId}>{inputLabel}</label>
        <input
          id={inputId}
          type="text"
          className={`w-full min-w-0 ${styles.input}`}
          placeholder={placeholder}
          maxLength={MAX_QUERY_LENGTH}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {/* Sits inside the field's right edge rather than beside it */}
        <button
          type="submit"
          className={`absolute flex items-center justify-center ${styles.send}`}
          aria-label="Send question"
        >
          <ArrowIcon size={32} className={styles.sendIcon} />
        </button>
      </form>
    </div>
  )

  // ── v1 / v3: corner window on desktop, sheet on mobile ──
  const overlayChrome = (
    <PanelPortal>
      {isFloating && (
        <button
          ref={launcherRef}
          type="button"
          className={`flex items-center gap-2 ${styles.launcher}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(o => !o)}
        >
          <span className={styles.launcherSparkle} aria-hidden="true">
            <AiSparkleIcon size={24} />
          </span>
          <span className={styles.launcherLabel}>{launcherLabel}</span>
          <span className={styles.launcherArrow} aria-hidden="true">
            <ArrowIcon size={20} />
          </span>
        </button>
      )}

      {open && (
        <div
          className={`${styles.floatingOverlay} md:hidden`}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-label="AI Translation Advisor"
        className={[
          styles.floating,
          open ? styles.floatingOpen : '',
          isFloating ? '' : styles.floatingNoLauncher,
        ].filter(Boolean).join(' ')}
        inert={!open}
      >
        {/* No title bar — the panel names itself via aria-label, and the
            conversation's own heading carries it visually. */}
        <button
          type="button"
          className={styles.floatingClose}
          aria-label="Close AI Translation Advisor"
          onClick={() => { setOpen(false); launcherRef.current?.focus() }}
        >
          <XIcon size={24} />
        </button>

        <div className={styles.floatingBody}>{conversation}</div>
        {composer}
      </div>
    </PanelPortal>
  )

  if (isFloating) return overlayChrome

  // ── v3: inline text link, no chevron, opening the same overlay ──
  if (isLink) {
    return (
      <>
        <button
          ref={launcherRef}
          type="button"
          className={`flex items-center ${styles.toggle}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(true)}
        >
          {toggleLabel}
        </button>
        {overlayChrome}
      </>
    )
  }

  // ── v2:  // ── v2: inline card under the engrave field ──
  return (
    <div className={`flex w-full flex-col ${styles.advisor}`}>
      <button
        type="button"
        className={`flex w-full items-center gap-2 ${styles.toggle}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
      >
        <span>{toggleLabel}</span>
        <ChevronIcon
          size={16}
          className={`${styles.toggleChevron} ${open ? styles.toggleChevronOpen : ''}`}
        />
      </button>

      {/* inert keeps the collapsed card out of the tab order and the a11y tree
          while still letting it animate open. */}
      <div
        id={panelId}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        inert={!open}
      >
        <div className={styles.panelInner}>
          <div className={styles.card}>
            {conversation}
            {composer}
          </div>
        </div>
      </div>
    </div>
  )
}
