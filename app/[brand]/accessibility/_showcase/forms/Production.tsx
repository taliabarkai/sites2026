'use client'

/**
 * Production today, for the Before view. Each one mirrors a live component —
 * markup and focus treatment — and names its source, so the comparison is
 * with what customers actually get, not a straw man.
 */

import { useId, useState } from 'react'
import { Button } from '../../../_components/Button'
import { Field } from '../../../_components/Field'
import { useBrandIcons } from '../useBrandIcons'
import today from './production.module.css'

/** Source: contact-us/page.tsx — visible label, focus is a border-color swap only. */
export function TodayTextarea({ label, defaultValue }: { label: string; defaultValue?: string }) {
  const id = useId()
  return (
    <div className={today.field}>
      <label htmlFor={id} className={today.label}>
        {label} <span aria-hidden="true">*</span>
      </label>
      <textarea id={id} rows={4} required aria-required="true" defaultValue={defaultValue} className={`${today.input} ${today.textarea}`} />
    </div>
  )
}

/** Source: QuickAddPanel.tsx — "9/12" counter: 11px, not linked to the field, never announced. */
export function TodayCounterField({ label, max, defaultValue = '' }: { label: string; max: number; defaultValue?: string }) {
  const id = useId()
  const [value, setValue] = useState(defaultValue)
  return (
    <div className={today.field}>
      <label htmlFor={id} className={today.label}>
        {label}
      </label>
      <div className={today.counterWrap}>
        <input
          id={id}
          maxLength={max}
          placeholder={label}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={today.input}
        />
        <span className={today.counter}>
          {value.length}/{max}
        </span>
      </div>
    </div>
  )
}

/** Source: checkout Country — aria-label only, the placeholder option stands in for a label. */
export function TodaySelect({ name, options }: { name: string; options: { value: string; label: string }[] }) {
  const { DropdownIcon } = useBrandIcons()
  return (
    <div className={today.selectWrap}>
      <select aria-label={name} defaultValue="" className={`${today.input} ${today.select}`}>
        <option value="" disabled hidden>
          Select {name}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={today.selectIcon} aria-hidden="true">
        <DropdownIcon className={today.icon} />
      </span>
    </div>
  )
}

/** Source: MusicMemoriesCustomizer song search — click only: no arrow keys, no Escape, no active option. */
export function TodayCombobox({ placeholder, options }: { placeholder: string; options: string[] }) {
  const id = useId()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const matches = options.filter((option) => option.toLowerCase().includes(value.trim().toLowerCase()))

  return (
    <div className={today.comboWrap}>
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={id}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={today.input}
      />
      <ul id={id} role="listbox" className={today.comboList} hidden={!open || matches.length === 0}>
        {matches.map((option) => (
          <li
            key={option}
            role="option"
            aria-selected={option === value}
            className={today.comboOption}
            onMouseDown={(event) => {
              event.preventDefault()
              setValue(option)
              setOpen(false)
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Sources: checkout opt-in (native, 16px) and the Music Memories upsell (hidden input, no focus style). */
export function TodayCheckboxes() {
  const upsellId = useId()
  return (
    <div className={today.stack}>
      <label className={today.checkboxLabel}>
        <input type="checkbox" className={today.nativeCheckbox} />
        <span>Email me about new arrivals</span>
      </label>
      <label htmlFor={upsellId} className={today.upsell}>
        <input id={upsellId} type="checkbox" className={today.hiddenInput} />
        <span className={today.fakeBox} aria-hidden="true" />
        <span>Add gift wrap (+$5)</span>
      </label>
    </div>
  )
}

/** Source: checkout shipping method — native radios in cards, role="radiogroup" with no visible legend. */
export function TodayRadios({ name, options }: { name: string; options: { value: string; label: string; hint?: string }[] }) {
  const id = useId()
  const [selected, setSelected] = useState(options[0]?.value)
  return (
    <div role="radiogroup" aria-label={name} className={today.stack}>
      {options.map((option) => (
        <label key={option.value} className={`${today.radioCard} ${selected === option.value ? today.radioCardSelected : ''}`}>
          <input
            type="radio"
            name={`${id}-radio`}
            value={option.value}
            checked={selected === option.value}
            onChange={() => setSelected(option.value)}
            className={today.nativeRadio}
          />
          <span>
            {option.label}
            {option.hint && <span className={today.radioHint}> {option.hint}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

/** Source: track-order — role="alert" banner, red borders, focus stays on the button. */
export function TodayErrorForm() {
  const [invalid, setInvalid] = useState(false)
  return (
    <form
      noValidate
      className={today.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setInvalid(true)
      }}
    >
      {invalid && (
        <div role="alert" className={today.errorBanner}>
          <p className={today.errorTitle}>We couldn&rsquo;t save your gift note</p>
          <p className={today.errorText}>Please check the highlighted fields.</p>
        </div>
      )}
      <Field label="To" placeholder="To" invalid={invalid} />
      <Field label="From" placeholder="From" invalid={invalid} />
      <Field label="Email" placeholder="Email" type="email" invalid={invalid} />
      <div>
        <Button type="submit" variant="primary">
          Save gift note
        </Button>
      </div>
    </form>
  )
}
