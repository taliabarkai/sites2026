'use client'

import { useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { CONTACT_CATEGORIES } from '../_config/contactContent'
import styles from './contact-us.module.css'

// ─── Pill group — single-select radiogroup ────────────────────────────────────

interface PillItem {
  id: string
  label: string
}

interface PillGroupProps {
  items: PillItem[]
  value: string | null
  onChange: (id: string) => void
  /** Labels the group for assistive tech — points at the visible section heading. */
  labelledBy: string
  /** Adds the "current step" ring to the selected pill (topic group only). */
  ringOnSelected?: boolean
}

function PillGroup({ items, value, onChange, labelledBy, ringOnSelected }: PillGroupProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  // Roving tabindex: the selected pill is the single tab stop, or the first pill
  // while nothing is selected yet.
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === value))

  // Arrow keys move focus and selection, matching native radiogroup behaviour.
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1
    let next: number | null = null

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last

    if (next === null) return
    event.preventDefault()
    onChange(items[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div className={styles.pillGrid} role="radiogroup" aria-labelledby={labelledBy}>
      {items.map((item, index) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === activeIndex ? 0 : -1}
            className={[
              styles.pill,
              selected && styles.pillSelected,
              selected && ringOnSelected && styles.pillCurrent,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactUsPage() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const category = useMemo(
    () => CONTACT_CATEGORIES.find((item) => item.id === categoryId) ?? null,
    [categoryId],
  )
  const topic = useMemo(
    () => category?.topics.find((item) => item.id === topicId) ?? null,
    [category, topicId],
  )

  // Changing category invalidates the topic below it, and any answers with it.
  function selectCategory(id: string) {
    setCategoryId(id)
    setTopicId(null)
    setValues({})
    setSubmitted(false)
  }

  // Changing topic swaps the field set, so previous answers no longer apply.
  function selectTopic(id: string) {
    setTopicId(id)
    setValues({})
    setSubmitted(false)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      brand,
      categoryId,
      topicId,
      fields: values,
    }
    // TODO: no contact-form endpoint exists in this project yet — POST the payload
    // once one is available (e.g. `await fetch('/api/contact', { method: 'POST', … })`).
    console.log('[contact-us] submit', payload)
    setSubmitted(true)
  }

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Contact Us</h1>

          {/* Section 1 — category */}
          <section className={styles.section} aria-labelledby="contact-category-heading">
            <h2 id="contact-category-heading" className={styles.sectionTitle}>
              What can we help you with?
            </h2>
            <PillGroup
              items={CONTACT_CATEGORIES}
              value={categoryId}
              onChange={selectCategory}
              labelledBy="contact-category-heading"
            />
          </section>

          {/* Section 2 — topic, revealed by a category selection */}
          {category && (
            <section className={styles.section} aria-labelledby="contact-topic-heading">
              <h2 id="contact-topic-heading" className={styles.sectionTitle}>
                Choose a topic
              </h2>
              <PillGroup
                items={category.topics}
                value={topicId}
                onChange={selectTopic}
                labelledBy="contact-topic-heading"
                ringOnSelected
              />
            </section>
          )}

          {/* Section 3 — form, revealed by a topic selection */}
          {topic && (
            <section className={styles.section} aria-labelledby="contact-form-heading">
              <h2 id="contact-form-heading" className={styles.srOnly}>
                {topic.label}
              </h2>
              <form className={styles.card} onSubmit={handleSubmit} noValidate={false}>
                <p className={styles.formIntro}>{topic.intro}</p>

                <div className={styles.fields}>
                  {topic.fields.map((field) => {
                    const fieldId = `contact-${field.id}`
                    const label = (
                      <label htmlFor={fieldId} className={styles.label}>
                        {field.label}
                        {field.required && (
                          <span className={styles.requiredMark} aria-hidden="true">
                            {' '}
                            *
                          </span>
                        )}
                      </label>
                    )

                    return (
                      <div key={field.id} className={styles.fieldGroup}>
                        {label}
                        {field.type === 'textarea' ? (
                          <textarea
                            id={fieldId}
                            name={field.id}
                            className={styles.textarea}
                            placeholder={field.placeholder}
                            required={field.required}
                            aria-required={field.required}
                            rows={4}
                            value={values[field.id] ?? ''}
                            onChange={(event) =>
                              setValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                            }
                          />
                        ) : (
                          <input
                            id={fieldId}
                            name={field.id}
                            type={field.type}
                            className={styles.input}
                            placeholder={field.placeholder}
                            required={field.required}
                            aria-required={field.required}
                            value={values[field.id] ?? ''}
                            onChange={(event) =>
                              setValues((prev) => ({ ...prev, [field.id]: event.target.value }))
                            }
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className={styles.submitRow}>
                  <Button type="submit" variant="primary">
                    Submit
                  </Button>
                  {submitted && (
                    <p className={styles.submitNote} role="status">
                      Thanks — your message is on its way. We&apos;ll reply within 24 hours.
                    </p>
                  )}
                </div>
              </form>
            </section>
          )}
        </div>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
