'use client'

import { useId, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { Checkbox } from '../_components/Checkbox'
import { Field } from '../_components/Field'
import { InputAction } from '../_components/InputAction'
import { OptionDropdown } from '../_components/ProductOptions/OptionDropdown'
import { OptionSelect } from '../_components/ProductOptions/OptionSelect'
import { TextInputOption } from '../_components/ProductOptions/TextInputOption'
import type { ChoiceGroup, TextInputGroup } from '../_components/ProductOptions/types'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './form-fields.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Demo config ───────────────────────────────────────────────────────────────

const COUNTRY: ChoiceGroup = {
  id: 'country',
  label: 'Country',
  display: 'select',
  values: [
    { id: 'us', label: 'United States' },
    { id: 'ca', label: 'Canada' },
    { id: 'gb', label: 'United Kingdom' },
    { id: 'au', label: 'Australia' },
  ],
}

const CHAIN: ChoiceGroup = {
  id: 'chain',
  label: 'Chain Length',
  display: 'list-dropdown',
  values: [
    { id: '16', label: '16"' },
    { id: '18', label: '18"' },
    { id: '20', label: '20"' },
    { id: '22', label: '22"' },
  ],
}

const INSCRIPTION: TextInputGroup = {
  kind: 'text-input',
  id: 'inscription',
  label: 'Inscription',
  maxLength: 12,
  placeholder: 'e.g. Sofia',
}

/**
 * Brands whose field fill moved to white. "Current" puts the old tint back
 * through --colors-surface-primary, which is the value the fill used to be.
 */
const FIELD_FILL_CHANGED: readonly string[] = ['mnn', 'ib']

// ─── Layout helpers ────────────────────────────────────────────────────────────

/** One field type: a title, where it lives in the product, and its states. */
function Specimen({ id, title, source, children }: { id: string; title: string; source: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        <h2 id={id} className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionNote}>{source}</p>
      </div>
      <div className={styles.states}>{children}</div>
    </section>
  )
}

/**
 * One state of a field. `focus` draws the focus ring without focusing anything,
 * so the state can sit on the page next to the others; `error` turns every
 * field border inside to the error colour, for components with no error prop.
 */
function State({ label, focus, error, children }: { label: string; focus?: boolean; error?: boolean; children: ReactNode }) {
  const cls = [styles.state, focus && styles.forceFocus, error && styles.invalid].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <p className={styles.stateLabel}>{label}</p>
      {children}
    </div>
  )
}

/** The error line under a field — always the shared 4px message gap below it. */
function ErrorMessage({ id, children }: { id?: string; children: ReactNode }) {
  return <p id={id} className={styles.message}>{children}</p>
}

// ─── Fields with no shared component ───────────────────────────────────────────

/** Large text field — contact us, customer feedback, gift notes. */
function TextArea({ label, defaultValue, error, disabled }: { label: string; defaultValue?: string; error?: string; disabled?: boolean }) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <textarea
        id={id}
        rows={4}
        placeholder="Tell us how we can help"
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.textarea} ${error ? styles.textareaInvalid : ''}`}
      />
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
    </div>
  )
}

/** Text field with button — the promo code in the checkout order summary. */
function CouponField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  return (
    <div className={styles.couponRow}>
      <Field label="Promo code" placeholder="Promo code" defaultValue={defaultValue} error={error} className={styles.couponInput} />
      <Button variant="primary" className={styles.couponButton}>Apply</Button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FormFieldsPage() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const icons = BRAND_ICONS[brand]
  const { ArrowIcon, EyeIcon } = icons

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const [country, setCountry] = useState('us')
  const [chain, setChain] = useState('18')
  const [inscription, setInscription] = useState('')
  const [inscriptionFilled, setInscriptionFilled] = useState('Sofia')
  const [checkedA, setCheckedA] = useState(false)
  const [checkedB, setCheckedB] = useState(true)

  const noop = () => {}

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main className={styles.content}>
        <div>
          <h1 className={styles.pageTitle}>Form Fields</h1>
          <p className={styles.intro}>
            Every text field and dropdown on the site, in each of its states. Each one is the
            live component (or, where there is no shared component, built from the same field
            tokens), so changing a token here changes it everywhere. Click any field to see the
            real focus ring.
          </p>
        </div>

        {/* ── Field fill: current vs new ── */}
        {FIELD_FILL_CHANGED.includes(brand) && (
          <section className={styles.section} aria-labelledby="ff-fill">
            <div className={styles.sectionHead}>
              <h2 id="ff-fill" className={styles.sectionTitle}>Field background — current vs new</h2>
              <p className={styles.sectionNote}>
                The tinted fill is gone: fields are white, the same as the page, and the border alone marks them out.
              </p>
            </div>
            <div className={styles.compare}>
              {[
                { key: 'current', title: 'Current', note: 'Tinted fill (--colors-surface-primary)', cls: styles.legacyFill },
                { key: 'new',     title: 'New',     note: 'White fill (--form-field-background)',   cls: '' },
              ].map(col => (
                <div key={col.key} className={`${styles.compareCol} ${col.cls}`}>
                  <div>
                    <p className={styles.compareTitle}>{col.title}</p>
                    <p className={styles.stateLabel}>{col.note}</p>
                  </div>
                  <Field label="Email address" placeholder="Email Address" type="email" />
                  <Field label="Email address" placeholder="Email Address" type="email" defaultValue="sofia@example" error="Enter a valid email address, like name@example.com" />
                  <OptionSelect group={COUNTRY} value={country} onChange={setCountry} />
                  <TextInputOption group={INSCRIPTION} value={inscriptionFilled} onChange={setInscriptionFilled} />
                  <TextArea label="Message" />
                  <CouponField />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Text field ── */}
        <Specimen id="ff-text" title="Text field" source="Field component · checkout contact & delivery, track order">
          <State label="Default">
            <Field label="Email address" placeholder="Email Address" type="email" />
          </State>
          <State label="Filled">
            <Field label="Email address" placeholder="Email Address" type="email" defaultValue="sofia@example.com" />
          </State>
          <State label="Focus" focus>
            <Field label="Email address" placeholder="Email Address" type="email" defaultValue="sofia@example.com" />
          </State>
          <State label="Error">
            <Field label="Email address" placeholder="Email Address" type="email" defaultValue="sofia@example" error="Enter a valid email address, like name@example.com" />
          </State>
          <State label="Disabled">
            <Field label="Email address" placeholder="Email Address" type="email" disabled />
          </State>
        </Specimen>

        {/* ── Floating label ── */}
        <Specimen id="ff-floating" title="Text field — floating label" source="Field component, floating variant · sign in / create account">
          <State label="Default">
            <Field variant="floating" label="Email" type="email" />
          </State>
          <State label="Filled">
            <Field variant="floating" label="Email" type="email" defaultValue="sofia@example.com" />
          </State>
          <State label="Focus" focus>
            <Field variant="floating" label="Email" type="email" defaultValue="sofia@example.com" />
          </State>
          <State label="Error">
            <Field variant="floating" label="Email" type="email" defaultValue="sofia@example" error="Enter a valid email address, like name@example.com" />
          </State>
          <State label="With action">
            <Field
              variant="floating"
              label="Password"
              type="password"
              defaultValue="hunter22"
              trailing={<button type="button" className={styles.iconButton} aria-label="Show password"><EyeIcon size={24} /></button>}
            />
          </State>
        </Specimen>

        {/* ── Large text field ── */}
        <Specimen id="ff-textarea" title="Large text field" source="No shared component · contact us, customer feedback, gift notes">
          <State label="Default">
            <TextArea label="Message" />
          </State>
          <State label="Filled">
            <TextArea label="Message" defaultValue="I'd like to change the engraving on my order." />
          </State>
          <State label="Focus" focus>
            <TextArea label="Message" defaultValue="I'd like to change the engraving on my order." />
          </State>
          <State label="Error">
            <TextArea label="Message" error="Tell us how we can help" />
          </State>
          <State label="Disabled">
            <TextArea label="Message" disabled />
          </State>
        </Specimen>

        {/* ── Text field with character count ── */}
        <Specimen id="ff-counter" title="Text field with character count" source="ProductOptions · TextInputOption · product page inscription">
          <State label="Default">
            <TextInputOption group={INSCRIPTION} value={inscription} onChange={setInscription} />
          </State>
          <State label="Filled">
            <TextInputOption group={INSCRIPTION} value={inscriptionFilled} onChange={setInscriptionFilled} />
          </State>
          <State label="Focus" focus>
            <TextInputOption group={INSCRIPTION} value="Sofia" onChange={noop} />
          </State>
          <State label="Error" error>
            <TextInputOption group={INSCRIPTION} value="Sofia ♥" onChange={noop} />
            <ErrorMessage>Use letters, numbers and spaces only</ErrorMessage>
          </State>
        </Specimen>

        {/* ── Dropdown (native) ── */}
        <Specimen id="ff-select" title="Dropdown" source="Native select · checkout country, product page options">
          <State label="Default">
            <OptionSelect group={COUNTRY} value={country} onChange={setCountry} />
          </State>
          <State label="Focus" focus>
            <OptionSelect group={COUNTRY} value={country} onChange={setCountry} />
          </State>
          <State label="Error" error>
            <OptionSelect group={COUNTRY} value={country} onChange={setCountry} />
            <ErrorMessage>We don&rsquo;t ship to this country yet</ErrorMessage>
          </State>
        </Specimen>

        {/* ── Dropdown (custom list) ── */}
        <Specimen id="ff-dropdown" title="Dropdown — custom list" source="ProductOptions · OptionDropdown · product page chain length, material">
          <State label="Default">
            <OptionDropdown group={CHAIN} value={chain} onChange={setChain} basePrice={0} />
          </State>
          <State label="Focus" focus>
            <OptionDropdown group={CHAIN} value={chain} onChange={setChain} basePrice={0} />
          </State>
          <State label="Error" error>
            <OptionDropdown group={CHAIN} value={chain} onChange={setChain} basePrice={0} />
            <ErrorMessage>Select a chain length</ErrorMessage>
          </State>
        </Specimen>

        {/* ── Text field with button ── */}
        <Specimen id="ff-coupon" title="Text field with button" source="Field + Button · checkout promo code">
          <State label="Default">
            <CouponField />
          </State>
          <State label="Filled">
            <CouponField defaultValue="SPRING20" />
          </State>
          <State label="Focus" focus>
            <CouponField defaultValue="SPRING20" />
          </State>
          <State label="Error">
            <CouponField defaultValue="SPRING2O" error="This code isn’t valid" />
          </State>
        </Specimen>

        {/* ── Footer text field ── */}
        <Specimen id="ff-footer" title="Footer text field" source="InputAction · footer newsletter signup (shown on the footer background)">
          <State label="Default">
            <div className={styles.footerSurface}>
              <InputAction inputType="email" placeholder="Email Address" buttonIcon={<ArrowIcon size={24} />} onSubmit={noop} groupLabel="Newsletter signup" inputLabel="Email address" />
            </div>
          </State>
          <State label="Focus" focus>
            <div className={styles.footerSurface}>
              <InputAction inputType="email" placeholder="Email Address" buttonIcon={<ArrowIcon size={24} />} onSubmit={noop} groupLabel="Newsletter signup" inputLabel="Email address" />
            </div>
          </State>
          <State label="Error">
            <div className={styles.footerSurface}>
              <InputAction inputType="email" placeholder="Email Address" buttonIcon={<ArrowIcon size={24} />} onSubmit={noop} groupLabel="Newsletter signup" inputLabel="Email address" errorMessage="Please enter a valid email address." />
            </div>
          </State>
          <State label="Disabled">
            <div className={styles.footerSurface}>
              <InputAction inputType="email" placeholder="Email Address" buttonIcon={<ArrowIcon size={24} />} onSubmit={noop} groupLabel="Newsletter signup" inputLabel="Email address" disabled />
            </div>
          </State>
        </Specimen>

        {/* ── Checkbox ── */}
        <Specimen id="ff-checkbox" title="Checkbox" source="Checkbox component · checkout marketing opt-in, billing same as shipping">
          <State label="Unchecked">
            <Checkbox checked={checkedA} onChange={setCheckedA} icons={icons}>Get offers and updates by text</Checkbox>
          </State>
          <State label="Checked">
            <Checkbox checked={checkedB} onChange={setCheckedB} icons={icons}>Yes, email me special offers</Checkbox>
          </State>
        </Specimen>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
