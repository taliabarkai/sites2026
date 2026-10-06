'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../../_components/Button'
import tokens from '../proposed-tokens.module.css'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import { useBrandIcons } from '../useBrandIcons'
import { SelectField } from '../forms/SelectField'
import styles from './buttons.module.css'

const LENGTHS = [
  { value: '', label: 'Choose a length' },
  { value: '16', label: '16" — at the collarbone' },
  { value: '18', label: '18" — just below the collarbone' },
  { value: '20', label: '20" — above the neckline' },
]

const METALS = [
  { key: 'vermeil', label: '18k gold vermeil', swatch: 'var(--gold-vermeil-18k)' },
  { key: 'silver', label: 'Sterling silver', swatch: 'var(--sterling-silver-925)' },
  { key: 'rose', label: '14k rose gold', swatch: 'var(--rose-gold-14k)' },
]

// ─── Variants ──────────────────────────────────────────────────────────────

/** The site's Button, plus the per-variant focus treatment and the text-button fixes. */
function Variants({ isAfter, demo }: { isAfter: boolean; demo?: 'hover' | 'focus' | 'disabled' }) {
  const { ring } = useShowcaseView()
  const disabled = demo === 'disabled'
  const wrap = demo === 'focus' ? tokens.forceFocus : ''
  const hover = (className: string) => (demo === 'hover' ? className : '')

  return (
    <div className={`${styles.row} ${wrap}`}>
      <Button variant="primary" disabled={disabled} className={`${ring(tokens.ringFilled)} ${hover(styles.hoverPrimary)}`}>
        Add to bag
      </Button>
      <Button variant="secondary" disabled={disabled} className={hover(styles.hoverSecondary)}>
        Add engraving
      </Button>
      <Button variant="upsell-primary" disabled={disabled}>
        Add matching earrings
      </Button>
      <Button
        variant="link"
        disabled={disabled}
        className={isAfter ? `${styles.textButton} ${tokens.ringLink} ${hover(styles.textButtonHover)}` : ''}
      >
        View details
      </Button>
    </div>
  )
}

export function ButtonVariantsCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="button-variants"
      title="Buttons"
      criteria={['2.4.7 Focus Visible', '1.4.3 Contrast (Minimum)', '2.5.8 Target Size (Minimum)']}
      notes={{
        before:
          'The site’s Button: no focus style of its own, so it gets the 0.5px ring. The text button is 20px tall and fades to 70% on hover.',
        after:
          'The same Button with the ring for its type. The text button keeps full color on hover, thickens its underline, and is at least 24px tall.',
      }}
      dos={[
        'Use one primary button per view, for the main action.',
        'Write the label as a verb: "Add to bag", not "Submit".',
        'Show hover with a change that keeps the contrast, like a darker fill or a thicker underline.',
      ]}
      donts={[
        "Don't fade a button or link with opacity on hover; it drops the contrast.",
        "Don't make a text button shorter than 24px.",
      ]}
      states={[
        { label: 'Default', content: <Variants isAfter /> },
        { label: 'Hover', content: <Variants isAfter demo="hover" /> },
        { label: 'Focus', content: <Variants isAfter demo="focus" /> },
        { label: 'Disabled', content: <Variants isAfter demo="disabled" /> },
      ]}
    >
      <Variants isAfter={isAfter} />
    </ShowcaseCard>
  )
}

// ─── Icon-only ─────────────────────────────────────────────────────────────

export function IconButtonsCard() {
  const { isAfter } = useShowcaseView()
  const { MagnifyingGlassIcon, ShoppingBagIcon, XIcon } = useBrandIcons()
  const buttonClass = isAfter ? styles.iconButton : styles.iconButtonToday

  return (
    <ShowcaseCard
      id="icon-buttons"
      title="Icon-only buttons"
      criteria={['4.1.2 Name, Role, Value', '2.5.8 Target Size (Minimum)', '2.4.7 Focus Visible']}
      notes={{
        before: 'Header icons: 24×24 with outline: none, so keyboard focus can’t be seen at all.',
        after: 'A 44×44 target around a 24px icon, a name for every button, and the ring on focus.',
      }}
      dos={[
        'Name every icon button with aria-label: "Search", "Bag, 2 items", "Close".',
        'Put the count in the name, not only in a badge.',
        'Grow the target with padding, not the icon.',
      ]}
      donts={["Don't remove the outline on icon buttons.", "Don't rely on a tooltip to name the button."]}
      states={[
        {
          label: 'Default',
          content: (
            <div className={styles.row}>
              <button type="button" aria-label="Search" className={styles.iconButton}>
                <MagnifyingGlassIcon className={styles.icon} />
              </button>
            </div>
          ),
        },
        {
          label: 'Focus',
          content: (
            <div className={`${styles.row} ${tokens.forceFocus}`}>
              <button type="button" aria-label="Search" className={styles.iconButton}>
                <MagnifyingGlassIcon className={styles.icon} />
              </button>
            </div>
          ),
        },
      ]}
    >
      <div className={styles.stack}>
        <div className={styles.row}>
          <button type="button" aria-label="Search" className={buttonClass}>
            <MagnifyingGlassIcon className={styles.icon} />
          </button>
          <button type="button" aria-label="Bag, 2 items" className={buttonClass}>
            <ShoppingBagIcon className={styles.icon} />
          </button>
          <button type="button" aria-label="Close" className={buttonClass}>
            <XIcon className={styles.icon} />
          </button>
        </div>
        <p className={styles.caption}>The wishlist (heart) button is waiting on a heart icon in all five brands.</p>
      </div>
    </ShowcaseCard>
  )
}

// ─── Loading ───────────────────────────────────────────────────────────────

function LoadingDemo() {
  const { SpinningCircleIcon, CheckmarkIcon } = useBrandIcons()
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [status, setStatus] = useState('')
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const add = () => {
    if (state !== 'idle') return
    setState('busy')
    setStatus('Adding to bag…')
    timers.current.push(
      window.setTimeout(() => {
        setState('done')
        setStatus('Added to bag. You have 2 items.')
      }, 1500),
      // Long enough to read; the bag count in the header keeps the result.
      window.setTimeout(() => setState('idle'), 6500),
    )
  }

  return (
    <div className={styles.stack}>
      <div>
        <Button
          variant="primary"
          aria-disabled={state === 'busy' || undefined}
          aria-busy={state === 'busy' || undefined}
          onClick={add}
          className={`${tokens.ringFilled} ${state === 'busy' ? styles.busy : ''}`}
          leadingIcon={
            state === 'busy' ? (
              <SpinningCircleIcon className={styles.spinner} />
            ) : state === 'done' ? (
              <CheckmarkIcon className={styles.icon} />
            ) : undefined
          }
        >
          {state === 'done' ? 'Added to bag' : 'Add to bag'}
        </Button>
      </div>
      {/* Announced politely; the button keeps focus the whole time */}
      <p role="status" className={styles.status}>
        {status}
      </p>
    </div>
  )
}

export function LoadingButtonCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="loading-button"
      title="Loading button"
      criteria={['4.1.3 Status Messages', '4.1.2 Name, Role, Value', '2.2.2 Pause, Stop, Hide']}
      notes={{
        before: 'Not on the site today: Add to bag shows no progress while the bag updates.',
        after:
          'The label stays "Add to bag" while a spinner runs, the button stays focusable (aria-disabled, not disabled), and the result is announced.',
      }}
      dos={[
        'Keep the label meaningful while it works; add a spinner beside it.',
        'Use aria-disabled while busy, so focus stays on the button.',
        'Announce the result in a status region.',
      ]}
      donts={[
        "Don't swap the label for a spinner alone.",
        "Don't use disabled while busy; focus jumps to the top of the page.",
      ]}
    >
      {isAfter ? (
        <LoadingDemo />
      ) : (
        <div>
          <Button variant="primary">Add to bag</Button>
        </div>
      )}
    </ShowcaseCard>
  )
}

// ─── Disabled vs aria-disabled ─────────────────────────────────────────────

function SoftDisabledDemo() {
  const id = useId()
  const [length, setLength] = useState('')
  const [message, setMessage] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={formRef} className={styles.stack}>
      <SelectField
        label="Chain length"
        options={LENGTHS}
        value={length}
        onChange={(event) => {
          setLength(event.target.value)
          setMessage('')
        }}
      />
      <div className={styles.row}>
        <Button
          variant="primary"
          aria-disabled={!length || undefined}
          aria-describedby={`${id}-why`}
          className={`${tokens.ringFilled} ${!length ? styles.softDisabled : ''}`}
          onClick={() => {
            if (!length) {
              setMessage('Choose a chain length first.')
              formRef.current?.querySelector('select')?.focus()
              return
            }
            setMessage(`Added the ${length}" necklace to your bag.`)
          }}
        >
          Add to bag
        </Button>
        <Button variant="secondary" disabled>
          Sold out in 22&Prime;
        </Button>
      </div>
      <p id={`${id}-why`} role="status" className={styles.status}>
        {message || (!length ? 'Choose a chain length to add this to your bag.' : '')}
      </p>
    </div>
  )
}

export function DisabledButtonCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="disabled-buttons"
      title="Disabled vs aria-disabled"
      criteria={['2.1.1 Keyboard', '3.3.2 Labels or Instructions', '4.1.2 Name, Role, Value']}
      notes={{
        before:
          'Checkout: Continue stays disabled until the step is valid. It can’t be focused, and nothing says what’s missing.',
        after:
          'Add to bag uses aria-disabled: it stays in the tab order, says why it isn’t ready, and pressing it moves you to what’s missing. "Sold out" uses disabled: nothing will make it work.',
      }}
      dos={[
        'Use aria-disabled when the user can fix the reason — and tell them how.',
        'Use disabled only when nothing on the page will enable it.',
      ]}
      donts={["Don't disable a submit button to stop errors; let it run and show what to fix."]}
    >
      {isAfter ? (
        <SoftDisabledDemo />
      ) : (
        <div className={styles.row}>
          <Button variant="primary" disabled>
            Continue to payment
          </Button>
        </div>
      )}
    </ShowcaseCard>
  )
}

// ─── Inline links ──────────────────────────────────────────────────────────

export function InlineLinksCard() {
  const { isAfter, ring } = useShowcaseView()
  const linkClass = isAfter ? `${styles.link} ${ring(tokens.ringLink)}` : styles.linkToday

  return (
    <ShowcaseCard
      id="inline-links"
      title="Inline links"
      criteria={['1.4.1 Use of Color', '2.4.4 Link Purpose (In Context)', '2.4.7 Focus Visible']}
      notes={{
        before: 'Order confirmation: underlined, but they fade to 70% on hover and have no focus style of their own.',
        after: 'Always underlined, a thicker underline on hover and focus, and new tabs are named in the link text.',
      }}
      dos={[
        'Underline links in body text; color alone isn’t enough.',
        'Name the destination: "care guide", not "click here".',
        'Say "(opens in a new tab)" when it does.',
      ]}
      donts={["Don't fade links on hover.", "Don't open a new tab without saying so."]}
    >
      <p className={styles.body}>
        Sterling silver darkens with time. Our{' '}
        <a href="#inline-links" className={linkClass}>
          jewelry care guide
        </a>{' '}
        shows how to clean it at home, or{' '}
        <a href="#inline-links" className={linkClass} target="_blank" rel="noreferrer">
          book a free polish{isAfter ? ' (opens in a new tab)' : ''}
        </a>{' '}
        with your order number.
      </p>
    </ShowcaseCard>
  )
}

// ─── Toggle button ─────────────────────────────────────────────────────────

function MetalFilter({ isAfter, demoFocus }: { isAfter: boolean; demoFocus?: boolean }) {
  const { CheckmarkIcon } = useBrandIcons()
  const [active, setActive] = useState<string[]>(['vermeil'])
  const toggle = (key: string) =>
    setActive((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]))

  return (
    <ul className={`${styles.filterList} ${demoFocus ? tokens.forceFocus : ''}`} aria-label="Metal">
      {METALS.map((metal) => {
        const pressed = active.includes(metal.key)
        return (
          <li key={metal.key}>
            {/* The label doesn't change; aria-pressed carries the state */}
            <button
              type="button"
              aria-pressed={pressed}
              onClick={() => toggle(metal.key)}
              className={isAfter ? styles.filterItem : styles.filterItemToday}
            >
              <span
                className={isAfter ? styles.filterSwatch : styles.filterSwatchToday}
                style={{ background: metal.swatch }}
                aria-hidden="true"
              />
              <span className={styles.filterLabel}>{metal.label}</span>
              {pressed && (
                <span aria-hidden="true">
                  <CheckmarkIcon className={styles.filterCheck} />
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function ToggleButtonCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="toggle-button"
      title="Toggle button"
      criteria={['4.1.2 Name, Role, Value', '1.4.11 Non-text Contrast', '1.4.1 Use of Color']}
      notes={{
        before:
          'Category metal filter: aria-pressed and a checkmark already, but the swatch border is #ebebeb and there’s no focus style.',
        after:
          'The same pattern with a 3:1 swatch border, a thick ring, bold text and a checkmark when pressed, and the ring on focus.',
      }}
      dos={['Keep the label the same and let aria-pressed say on or off.', 'Show pressed with a mark and weight, not color alone.']}
      donts={["Don't change the label and set aria-pressed; it's read as \"Remove from filter, pressed\"."]}
      states={[
        { label: 'One pressed', content: <MetalFilter isAfter /> },
        { label: 'Focus', content: <MetalFilter isAfter demoFocus /> },
      ]}
    >
      <MetalFilter isAfter={isAfter} />
    </ShowcaseCard>
  )
}
