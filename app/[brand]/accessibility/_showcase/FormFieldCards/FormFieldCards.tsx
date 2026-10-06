'use client'

import { Field } from '../../../_components/Field'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import { Checkbox, RadioGroup, Switch } from '../forms/Choices'
import { Combobox } from '../forms/Combobox'
import { ErrorSummaryForm } from '../forms/ErrorSummaryForm'
import {
  TodayCheckboxes,
  TodayCombobox,
  TodayCounterField,
  TodayErrorForm,
  TodayRadios,
  TodaySelect,
  TodayTextarea,
} from '../forms/Production'
import { SelectField } from '../forms/SelectField'
import { TextField } from '../forms/TextField'
import styles from './FormFieldCards.module.css'

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'il', label: 'Israel' },
]

const BIRTH_FLOWERS = [
  'January — Carnation',
  'February — Violet',
  'March — Daffodil',
  'April — Daisy',
  'May — Lily of the valley',
  'June — Rose',
  'July — Larkspur',
  'August — Gladiolus',
  'September — Aster',
  'October — Marigold',
  'November — Chrysanthemum',
  'December — Narcissus',
]

const SHIPPING = [
  { value: 'standard', label: 'Standard, free', hint: '5–7 business days' },
  { value: 'express', label: 'Express, $15', hint: '2–3 business days' },
  { value: 'overnight', label: 'Overnight, $30', hint: 'Order by 2pm for next-day delivery' },
]

/** Lays out the live demos in a card: one or more controls, stacked. */
function Stack({ children }: { children: React.ReactNode }) {
  return <div className={styles.stack}>{children}</div>
}

function NotOnSite({ what }: { what: string }) {
  return <p className={styles.notOnSite}>There&rsquo;s no {what} on the site today.</p>
}

// ─── Text field ────────────────────────────────────────────────────────────

export function TextFieldCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="text-field"
      title="Text field"
      criteria={['3.3.2 Labels or Instructions', '3.3.1 Error Identification', '2.4.7 Focus Visible', '1.4.11 Non-text Contrast']}
      notes={{
        before:
          'The site’s Field component: the label is hidden and the name shows as placeholder text, gone once you type. Focus swaps the border; errors are a red border.',
        after:
          'A label that stays visible, "(required)" in words, a hint, and errors with an icon and words, linked to the field.',
      }}
      dos={[
        'Keep the label visible above the field, even when it has a value.',
        'Say "(required)" in words; an asterisk alone needs explaining.',
        'Say what went wrong and how to fix it: "Enter an email address, like name@example.com".',
      ]}
      donts={[
        "Don't use the placeholder as the label.",
        "Don't show an error with a red border alone.",
        "Don't swap the border color as the only sign of focus.",
      ]}
      states={[
        { label: 'Default', content: <TextField label="Email address" required placeholder="name@example.com" /> },
        { label: 'Hover', content: <TextField label="Email address" required demoState="hover" /> },
        { label: 'Focus', content: <TextField label="Email address" required demoState="focus" /> },
        { label: 'Filled', content: <TextField label="Email address" required defaultValue="maya@example.com" /> },
        {
          label: 'Error',
          content: (
            <TextField
              label="Email address"
              required
              defaultValue="maya@example"
              error="Enter an email address in the correct format, like name@example.com"
            />
          ),
        },
        { label: 'Success', content: <TextField label="Gift card code" defaultValue="LOVE-2026" success="Gift card applied: $50 off" /> },
        { label: 'Disabled', content: <TextField label="Email address" defaultValue="maya@example.com" disabled /> },
        { label: 'Read-only', content: <TextField label="Order number" defaultValue="OAL-10482" readOnly /> },
      ]}
    >
      {isAfter ? (
        <Stack>
          <TextField
            label="Email address"
            required
            type="email"
            autoComplete="email"
            hint="We'll send your order confirmation here."
            placeholder="name@example.com"
          />
          <TextField
            label="Phone number"
            type="tel"
            autoComplete="tel"
            defaultValue="555 01"
            error="Enter a phone number with 10 digits, like 555 012 3456"
          />
        </Stack>
      ) : (
        <Stack>
          <Field label="Email address" placeholder="Email address" type="email" />
          <Field label="Phone number" placeholder="Phone number" type="tel" defaultValue="555 01" invalid />
        </Stack>
      )}
    </ShowcaseCard>
  )
}

// ─── Character counter ─────────────────────────────────────────────────────

export function CounterFieldCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="engraving-field"
      title="Engraving field with character counter"
      criteria={['4.1.3 Status Messages', '3.3.2 Labels or Instructions', '1.4.3 Contrast (Minimum)']}
      notes={{
        before: 'Quick add: an 11px "9/12" inside the field, not linked to it and never announced.',
        after:
          'The limit is in the hint, the count sits under the field and is linked to it, and a screen reader hears what’s left once typing pauses.',
      }}
      dos={[
        'Say the limit before they type: "Up to 12 letters".',
        'Link the count to the field with aria-describedby, so it’s read on focus.',
        'Announce what’s left after a pause, and always at the limit.',
      ]}
      donts={[
        "Don't announce the count on every key; it talks over the typing.",
        "Don't put the count inside the field in tiny grey text.",
      ]}
    >
      {isAfter ? (
        <TextField
          label="Name to engrave"
          hint="Up to 12 letters. We engrave exactly what you type, including capitals."
          maxLength={12}
          counter
          defaultValue="Josephine"
          autoComplete="off"
        />
      ) : (
        <TodayCounterField label="Name to engrave" max={12} defaultValue="Josephine" />
      )}
    </ShowcaseCard>
  )
}

// ─── Textarea ──────────────────────────────────────────────────────────────

export function TextareaCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="textarea"
      title="Textarea"
      criteria={['2.4.7 Focus Visible', '3.3.2 Labels or Instructions', '1.4.11 Non-text Contrast']}
      notes={{
        before: 'Contact us: a visible label, but focus is a border-color swap and the asterisk isn’t explained.',
        after: 'The same rules as the text field, with a counter for the gift message limit.',
      }}
      dos={['Let it grow with the text, or resize vertically.', 'Show a counter when there’s a limit.']}
      donts={["Don't fix the height so the text scrolls inside a tiny box.", "Don't rely on an asterisk without a key."]}
      states={[
        { label: 'Default', content: <TextField multiline label="Gift message" /> },
        { label: 'Focus', content: <TextField multiline label="Gift message" demoState="focus" /> },
        { label: 'Error', content: <TextField multiline label="Gift message" required error="Enter a gift message, or turn off the gift card" /> },
        { label: 'Disabled', content: <TextField multiline label="Gift message" disabled defaultValue="Happy birthday, love Mom" /> },
      ]}
    >
      {isAfter ? (
        <TextField
          multiline
          label="Gift message"
          hint="Printed on a card inside the box."
          maxLength={200}
          counter
          defaultValue="Happy birthday! I saw this and thought of you."
        />
      ) : (
        <TodayTextarea label="Gift message" defaultValue="Happy birthday! I saw this and thought of you." />
      )}
    </ShowcaseCard>
  )
}

// ─── Select ────────────────────────────────────────────────────────────────

export function SelectCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="select"
      title="Select"
      criteria={['3.3.2 Labels or Instructions', '2.4.7 Focus Visible', '1.4.11 Non-text Contrast']}
      notes={{
        before: 'Checkout country: no visible label — "Select Country" is a hidden option — and focus is a border swap.',
        after: 'A native select with a visible label, the field ring on focus, and the brand’s dropdown icon.',
      }}
      dos={['Use a native <select>: keyboard, screen reader and phone pickers work for free.', 'Keep a visible label.']}
      donts={["Don't build a custom dropdown for a plain list of options.", "Don't use the first option as the label."]}
      states={[
        { label: 'Default', content: <SelectField label="Country or region" options={COUNTRIES} /> },
        { label: 'Hover', content: <SelectField label="Country or region" options={COUNTRIES} demoState="hover" /> },
        { label: 'Focus', content: <SelectField label="Country or region" options={COUNTRIES} demoState="focus" /> },
        { label: 'Error', content: <SelectField label="Country or region" options={COUNTRIES} required error="Select a country or region" /> },
        { label: 'Disabled', content: <SelectField label="Country or region" options={COUNTRIES} disabled /> },
      ]}
    >
      {isAfter ? (
        <SelectField label="Country or region" options={COUNTRIES} required autoComplete="country" />
      ) : (
        <TodaySelect name="Country" options={COUNTRIES} />
      )}
    </ShowcaseCard>
  )
}

// ─── Autocomplete ──────────────────────────────────────────────────────────

export function ComboboxCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="autocomplete"
      title="Autocomplete"
      criteria={['2.1.1 Keyboard', '4.1.2 Name, Role, Value', '4.1.3 Status Messages']}
      notes={{
        before:
          'Music Memories song search: options can only be clicked — no arrow keys, no Escape, no active option — and focus is a border swap.',
        after:
          'Type to filter, Down and Up to move, Enter to choose, Escape to close (twice to clear). The number of results is announced.',
      }}
      dos={[
        'Keep focus in the input and point aria-activedescendant at the active option.',
        'Show the active option with more than a tint.',
        'Announce how many results there are as the list changes.',
      ]}
      donts={["Don't make options reachable by mouse only.", "Don't move focus into the list."]}
      states={[
        { label: 'Open, first option active', content: <Combobox label="Birth flower" options={BIRTH_FLOWERS.slice(0, 4)} demoOpen /> },
      ]}
    >
      {isAfter ? (
        <Combobox label="Birth flower" hint="Engraved beside the name. Start typing a month or a flower." options={BIRTH_FLOWERS} />
      ) : (
        <TodayCombobox placeholder="Type to search birth flowers…" options={BIRTH_FLOWERS} />
      )}
    </ShowcaseCard>
  )
}

// ─── Checkbox ──────────────────────────────────────────────────────────────

export function CheckboxCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="checkbox"
      title="Checkbox"
      criteria={['1.4.11 Non-text Contrast', '2.4.7 Focus Visible', '2.5.8 Target Size (Minimum)', '1.4.1 Use of Color']}
      notes={{
        before:
          'Checkout uses a 16px browser checkbox; the Music Memories upsell hides the real one and draws a box with no focus style at all.',
        after: 'A 24px box with a 3:1 border, a checkmark when checked, the label as part of the target, and the ring on focus.',
      }}
      dos={['Make the label clickable too.', 'Show checked with a mark, not a fill alone.']}
      donts={["Don't hide the native checkbox without giving the drawn one a focus ring."]}
      states={[
        { label: 'Unchecked', content: <Checkbox label="Add gift wrap" /> },
        { label: 'Checked', content: <Checkbox label="Add gift wrap" defaultChecked /> },
        { label: 'Focus', content: <Checkbox label="Add gift wrap" demoState="focus" /> },
        { label: 'Error', content: <Checkbox label="I agree to the engraving terms" error="Agree to the engraving terms to continue" /> },
        { label: 'Disabled', content: <Checkbox label="Add gift wrap" disabled /> },
      ]}
    >
      {isAfter ? (
        <Stack>
          <Checkbox label="Add gift wrap" hint="+$5. Wrapped in our signature paper with a ribbon." />
          <Checkbox label="Email me about new arrivals" defaultChecked />
        </Stack>
      ) : (
        <TodayCheckboxes />
      )}
    </ShowcaseCard>
  )
}

// ─── Radio group ───────────────────────────────────────────────────────────

export function RadioGroupCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="radio-group"
      title="Radio group"
      criteria={['1.3.1 Info and Relationships', '2.1.1 Keyboard', '1.4.11 Non-text Contrast']}
      notes={{
        before: 'Checkout shipping: native radios in cards, but the group has no visible question, and focus is the browser default.',
        after:
          'A fieldset with a visible legend, so each option is read with its question. Arrow keys move between options; Tab leaves the group.',
      }}
      dos={['Wrap the group in fieldset and legend.', 'Show the selected option with a dot, not just a darker border.']}
      donts={["Don't let a selected radio be deselected by clicking it again.", "Don't hide a sold-out option; show it disabled and say why."]}
      states={[
        { label: 'Selected', content: <RadioGroup legend="Delivery" name="state-selected" options={SHIPPING.slice(0, 2)} defaultValue="standard" /> },
        { label: 'Focus', content: <RadioGroup legend="Delivery" name="state-focus" options={SHIPPING.slice(0, 2)} defaultValue="standard" demoFocusValue="standard" /> },
        { label: 'Disabled option', content: <RadioGroup legend="Delivery" name="state-disabled" options={SHIPPING} defaultValue="standard" disabledValues={['overnight']} /> },
      ]}
    >
      {isAfter ? (
        <RadioGroup legend="Delivery" name="delivery" options={SHIPPING} defaultValue="standard" />
      ) : (
        <TodayRadios name="Shipping method" options={SHIPPING} />
      )}
    </ShowcaseCard>
  )
}

// ─── Switch ────────────────────────────────────────────────────────────────

export function SwitchCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="toggle-switch"
      title="Toggle switch"
      criteria={['4.1.2 Name, Role, Value', '1.4.1 Use of Color', '1.4.11 Non-text Contrast']}
      notes={{
        before: 'Not on the site today: on/off settings use a checkbox or a pressed button.',
        after: 'role="switch" on a native checkbox, read as on or off. The word beside it says the state too.',
      }}
      dos={['Use a switch for a setting that applies at once.', 'Show on/off with position and a word, not color alone.']}
      donts={["Don't use a switch inside a form that needs a Save button; use a checkbox there."]}
      states={[
        { label: 'Off', content: <Switch label="Hide prices on the gift receipt" /> },
        { label: 'On', content: <Switch label="Hide prices on the gift receipt" defaultChecked /> },
        { label: 'Focus', content: <Switch label="Hide prices on the gift receipt" demoState="focus" /> },
      ]}
    >
      {isAfter ? (
        <Switch label="Hide prices on the gift receipt" hint="The receipt in the box won't show what you paid." />
      ) : (
        <NotOnSite what="toggle switch" />
      )}
    </ShowcaseCard>
  )
}

// ─── Error summary ─────────────────────────────────────────────────────────

export function ErrorSummaryCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="error-summary"
      title="Error summary"
      criteria={['3.3.1 Error Identification', '3.3.3 Error Suggestion', '2.4.3 Focus Order']}
      notes={{
        before:
          'Track order: an alert banner says to check "the highlighted fields", which are only marked by a red border. Focus stays on the button.',
        after:
          'Submit with empty fields: a summary appears at the top and takes focus. Each line links to its field, and each field says what to fix.',
      }}
      dos={[
        'Move focus to the summary, so it’s read and the next Tab starts there.',
        'Make each line a link that moves focus into its field.',
        'Use the same words in the summary and under the field.',
      ]}
      donts={["Don't say \"check the highlighted fields\" — say which and why.", "Don't leave focus on the submit button."]}
    >
      {isAfter ? <ErrorSummaryForm /> : <TodayErrorForm />}
    </ShowcaseCard>
  )
}
