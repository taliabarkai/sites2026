'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../_components/Button'
import tokens from '../proposed-tokens.module.css'
import { TextField } from './TextField'
import summary from './errorSummary.module.css'

interface Errors {
  to?: string
  from?: string
  email?: string
}

function validate(data: FormData): Errors {
  const errors: Errors = {}
  const email = String(data.get('email') ?? '').trim()
  if (!String(data.get('to') ?? '').trim()) errors.to = 'Enter who the gift is for'
  if (!String(data.get('from') ?? '').trim()) errors.from = 'Enter who the gift is from'
  if (!email) errors.email = 'Enter an email address for the delivery note'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter an email address in the correct format, like name@example.com'
  return errors
}

/**
 * On submit with errors: a summary appears above the form and takes focus,
 * so a screen reader reads it and a keyboard user starts from it. Each line
 * links to its field; each field also shows its own message.
 */
export function ErrorSummaryForm() {
  const id = useId()
  const summaryRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const fieldId = (name: keyof Errors) => `${id}-${name}`
  const entries = Object.entries(errors) as [keyof Errors, string][]

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate(new FormData(event.currentTarget))
    setErrors(next)
    const ok = Object.keys(next).length === 0
    setSent(ok)
    // After React paints the summary (or the confirmation)
    requestAnimationFrame(() => (ok ? sentRef : summaryRef).current?.focus())
  }

  return (
    <form noValidate onSubmit={onSubmit} className={summary.form}>
      {entries.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          aria-labelledby={`${id}-summary-title`}
          className={summary.summary}
        >
          <h4 id={`${id}-summary-title`} className={summary.title}>
            {entries.length === 1 ? 'There is a problem with 1 field' : `There are problems with ${entries.length} fields`}
          </h4>
          <ul className={summary.list}>
            {entries.map(([name, message]) => (
              <li key={name}>
                <a
                  href={`#${fieldId(name)}`}
                  className={`${summary.link} ${tokens.ringLink}`}
                  onClick={(event) => {
                    // Move focus into the field, not just scroll to it
                    event.preventDefault()
                    document.getElementById(fieldId(name))?.focus()
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sent && (
        <p ref={sentRef} tabIndex={-1} className={summary.sent}>
          Gift note saved.
        </p>
      )}

      <FieldById id={fieldId('to')} label="To" name="to" error={errors.to} autoComplete="off" />
      <FieldById id={fieldId('from')} label="From" name="from" error={errors.from} autoComplete="name" />
      <FieldById
        id={fieldId('email')}
        label="Email for the delivery note"
        name="email"
        type="email"
        hint="We'll email this address when the gift is delivered."
        error={errors.email}
        autoComplete="email"
      />
      <div>
        <Button type="submit" variant="primary" className={tokens.ringFilled}>
          Save gift note
        </Button>
      </div>
    </form>
  )
}

/** TextField with an id the summary can link to. */
function FieldById({ id, ...props }: { id: string } & Parameters<typeof TextField>[0]) {
  return <TextField {...props} required inputId={id} />
}
