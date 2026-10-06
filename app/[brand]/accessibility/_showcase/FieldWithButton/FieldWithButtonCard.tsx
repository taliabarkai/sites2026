'use client'

import { ShowcaseCard } from '../ShowcaseCard'
import { FieldWithButton, type FieldWithButtonProps } from './FieldWithButton'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const promo: Pick<FieldWithButtonProps, 'label' | 'buttonLabel' | 'validate' | 'success' | 'autoComplete'> = {
  label: 'Promo code',
  buttonLabel: 'Apply promo code',
  autoComplete: 'off',
  validate: (value) => (value ? null : 'Enter a promo code'),
  success: (value) => `${value.toUpperCase()} applied: 15% off`,
}

const newsletter: Pick<FieldWithButtonProps, 'label' | 'buttonLabel' | 'validate' | 'success' | 'autoComplete' | 'type'> = {
  label: 'Email address',
  buttonLabel: 'Subscribe',
  type: 'email',
  autoComplete: 'email',
  validate: (value) =>
    !value ? 'Enter your email address' : EMAIL.test(value) ? null : 'Enter an email address like name@example.com',
  success: () => 'You’re on the list. Check your inbox for 15% off.',
}

export function FieldWithButtonCard() {
  return (
    <ShowcaseCard
      id="field-with-button"
      title="Text field with button"
      criteria={['2.4.7 Focus Visible', '1.4.11 Non-text Contrast', '3.3.2 Labels or Instructions', '4.1.2 Name, Role, Value']}
      notes={{
        before:
          'Live site (promo code at checkout, newsletter in the footer): the ring wraps only the text field, and the button cuts it off.',
        after:
          'While you type, one ring wraps the whole row — field and button — in the row’s own shape. The button has its own ring inside it, and the row stays quiet then. In the footer the ring takes the band’s text color.',
      }}
      dos={[
        'Ring the whole row while the text field has focus.',
        'Give the arrow button a name: "Apply promo code", "Subscribe".',
        'Keep the label visible in the field, and say what went wrong under it.',
      ]}
      donts={[
        "Don't ring just the text field; the button crops it.",
        "Don't light up the whole row when the button has focus.",
        "Don't rely on a placeholder as the only label.",
      ]}
      states={[
        { label: 'Default', content: <FieldWithButton {...promo} /> },
        { label: 'Text field focused', content: <FieldWithButton {...promo} defaultValue="LOVE15" demoState="focus" /> },
        { label: 'Button focused', content: <FieldWithButton {...promo} defaultValue="LOVE15" demoState="buttonFocus" /> },
        { label: 'Error', content: <FieldWithButton {...newsletter} defaultValue="maya@example" demoError="Enter an email address like name@example.com" /> },
        { label: 'In the footer, focused', content: <FieldWithButton {...newsletter} surface="footer" demoState="focus" /> },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <FieldWithButton {...promo} />
        <FieldWithButton {...newsletter} surface="footer" />
      </div>
    </ShowcaseCard>
  )
}
