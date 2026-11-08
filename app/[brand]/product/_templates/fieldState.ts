/**
 * Template fields → the mockup's ProductOptions groups, and everything the
 * page reads back out of them (visibility, repeat counts, price, the cart
 * payload, the preview's inputs). Pure functions over the template and the
 * ProductOptions state — no brand or product ids anywhere.
 */
import type { OptionGroup, OptionsState, SelectedOption, TextInputGroup } from '../../_components/ProductOptions'
import { DISPLAY_TYPE_TO_OPTION_DISPLAY, fieldById, type Field, type FieldDisplayType, type PdpTemplate, type VisibleWhen } from './pdpTemplate'

const DEFAULT_TEXT_MAX = 20

/** ProductOptions group id for a field (and for one unit of a repeated field). */
export const groupId = (fieldId: number, unit?: number) => (unit === undefined ? `f${fieldId}` : `f${fieldId}-${unit}`)

/** A field that is drawn as a text input rather than a choice. */
const isTextField = (f: Field) => f.type === 'text'

/** Derived fields are read-only text, never a group. */
const isDerived = (f: Field) => !!f.derivedFrom

/**
 * The count a selection field stands for ("3 Names + 2 Diamonds" → 3). The
 * schema has no numeric value on a FieldValue, so the count is read from the
 * value id — see the handoff notes.
 */
export function countOf(template: PdpTemplate, state: OptionsState, countFieldId: number): number {
  const field = fieldById(template, countFieldId)
  const valueId = state.choices[groupId(countFieldId)] ?? field?.defaultValueId ?? field?.values?.[0]?.id ?? ''
  const n = parseInt(valueId, 10)
  return Number.isFinite(n) ? n : 0
}

export function repeatCount(template: PdpTemplate, field: Field, state: OptionsState): number {
  if (!field.repeat) return 1
  const { countFieldId, min, max } = field.repeat
  return Math.min(max, Math.max(min, countOf(template, state, countFieldId)))
}

/** Whether a `visibleWhen` holds — every condition in a list. */
export function conditionHolds(when: VisibleWhen | undefined, state: OptionsState): boolean {
  if (!when) return true
  return (Array.isArray(when) ? when : [when]).every((c) => {
    const selected = state.choices[groupId(c.fieldId)]
    return !!selected && c.valueIds.includes(selected)
  })
}

export function isVisible(field: Field, state: OptionsState): boolean {
  return conditionHolds(field.visibleWhen, state)
}

/** The values a selection field offers right now (some only show with another choice). */
export const offeredValues = (field: Field, state: OptionsState) =>
  (field.values ?? []).filter((v) => conditionHolds(v.visibleWhen, state))

const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'}`

/** One unit's label of a repeated field: `{n}` → "2" ("Name 2"), `{nth}` → "2nd" ("2nd initial"). */
export const repeatLabel = (field: Field, unit: number) =>
  field.repeat ? field.repeat.labelPattern.replace('{nth}', ordinal(unit)).replace('{n}', String(unit)) : field.name

function textGroup(field: Field, unit?: number): TextInputGroup {
  const label = unit === undefined || !field.repeat ? field.name : repeatLabel(field, unit)
  return {
    kind: 'text-input',
    id: groupId(field.fieldId, unit),
    label,
    maxLength: field.textMaxLength ?? DEFAULT_TEXT_MAX,
    placeholder: field.placeholder,
    required: field.isRequired,
    keyboard: field.keyboard,
  }
}

/**
 * The ProductOptions groups for one field, given the current state (a repeat
 * expands to its count). `displayType` overrides the field's own — a step's
 * `display` entry.
 */
export function groupsForField(template: PdpTemplate, field: Field, state: OptionsState, displayType?: FieldDisplayType): OptionGroup[] {
  if (isDerived(field)) return []
  if (isTextField(field)) {
    if (!field.repeat) return [textGroup(field)]
    return Array.from({ length: repeatCount(template, field, state) }, (_, i) => textGroup(field, i + 1))
  }
  const map = DISPLAY_TYPE_TO_OPTION_DISPLAY[displayType ?? field.displayType ?? 'text']
  return [{
    kind: 'choice',
    id: groupId(field.fieldId),
    label: field.name,
    display: map.display,
    // Tiles with neither a picture nor a color to show draw as text (the diamond sizes)
    tile: map.tile === 'standard' && (field.values ?? []).every((v) => !v.image && !v.swatchColor) ? 'text' : map.tile,
    // The page price comes from templatePrice, so a hidden delta still counts
    values: offeredValues(field, state).map(({ id, label, image, swatchColor, priceDelta, priceLabel, disabled }) => ({
      id, label, image, swatchColor, priceLabel, disabled,
      priceDelta: field.showPriceDelta === false ? undefined : priceDelta,
    })),
    defaultValueId: field.defaultValueId,
    required: field.isRequired,
  }]
}

/**
 * Every group the template could ever show, with each repeat at its max —
 * seeds useProductOptions so hidden fields keep their defaults when they appear.
 */
export function allGroups(template: PdpTemplate): OptionGroup[] {
  const seed: OptionsState = { choices: {}, text: {}, addons: {} }
  return template.fields.flatMap((f) => {
    if (f.repeat && isTextField(f)) return Array.from({ length: f.repeat.max }, (_, i) => textGroup(f, i + 1))
    return groupsForField(template, f, seed)
  })
}

// ─── Price ──────────────────────────────────────────────────────────────────

/** "$199" → 19900. The schema carries the base price only as a display string. */
export const parsePriceLabel = (label?: string) => {
  const n = Number((label ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

const selectedValue = (field: Field, state: OptionsState) =>
  field.values?.find((v) => v.id === state.choices[groupId(field.fieldId)])

/** base (the `pricing: 'base'` field's priceLabel) + every visible `delta` field's priceDelta. */
export function templatePrice(template: PdpTemplate, state: OptionsState, fallbackBase = 0): number {
  let price = 0
  let hasBase = false
  for (const f of template.fields) {
    if (!isVisible(f, state)) continue
    const v = selectedValue(f, state)
    if (!v) continue
    if (f.pricing === 'base') { price += parsePriceLabel(v.priceLabel); hasBase = true }
    if (f.pricing === 'delta') price += v.priceDelta ?? 0
  }
  // Text priced by its length (each initial past the first)
  for (const f of template.fields) {
    if (!f.pricePerCharacter || !isVisible(f, state)) continue
    const length = textValues(template, f, state).join('').replace(/\s/g, '').length
    price += Math.max(0, length - f.pricePerCharacter.included) * f.pricePerCharacter.cents
  }
  return hasBase ? price : fallbackBase + price
}

// ─── Read-backs ─────────────────────────────────────────────────────────────

export function derivedText(template: PdpTemplate, field: Field, state: OptionsState): string | null {
  if (!field.derivedFrom) return null
  return field.derivedFrom.label(countOf(template, state, field.derivedFrom.fieldId))
}

/** The text values of a field, one per unit for a repeat (empty strings kept so positions hold). */
export function textValues(template: PdpTemplate, field: Field, state: OptionsState): string[] {
  if (!field.repeat) return [state.text[groupId(field.fieldId)] ?? '']
  return Array.from({ length: repeatCount(template, field, state) }, (_, i) => state.text[groupId(field.fieldId, i + 1)] ?? '')
}

/** Required text inputs (by group id) that are still empty among the given fields. */
/**
 * `conditional: false` skips the conditional minimums — moving on to the next
 * step mid-flow, before the choice they hang on (the stone) has been made.
 */
export function missingRequired(template: PdpTemplate, fields: Field[], state: OptionsState, opts: { conditional?: boolean } = {}): string[] {
  const conditional = opts.conditional ?? true
  return fields
    .filter((f) => isTextField(f) && f.isRequired && isVisible(f, state))
    .flatMap((f) => groupsForField(template, f, state).map((g) => ({ f, g })))
    .filter(({ f, g }) => {
      const text = (state.text[g.id] ?? '').trim()
      return !text || (conditional && tooShort(f, text, state))
    })
    .map(({ g }) => g.id)
}

/** A text that's there but under the field's conditional minimum (a stone needs two initials). */
export function tooShort(field: Field, text: string, state: OptionsState): boolean {
  const rule = field.minLengthWhen
  return !!rule && conditionHolds(rule.when, state) && text.replace(/\s/g, '').length < rule.min
}

/** The cart line's options, in field order, labelled with each field's cartName. */
/**
 * What a saved personalization shows, one line per answer, in the shopper's
 * words: "Your name — Talia", "Chain length — 16"". Text fields keep their own
 * label (a repeat numbers them, "Name 2"); choices use their cart name.
 */
export function summaryLines(template: PdpTemplate, fields: Field[], state: OptionsState): { label: string; value: string }[] {
  const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const out: { label: string; value: string }[] = []
  for (const f of [...fields].sort((a, b) => a.order - b.order)) {
    if (!isVisible(f, state) || f.derivedFrom) continue
    if (isTextField(f)) {
      textValues(template, f, state).forEach((t, i) => {
        if (t.trim()) out.push({ label: f.repeat ? repeatLabel(f, i + 1) : f.name, value: t.trim() })
      })
    } else {
      const v = selectedValue(f, state)
      if (v) out.push({ label: sentence(f.cartName), value: v.label })
    }
  }
  return out
}

export function cartOptions(template: PdpTemplate, state: OptionsState): SelectedOption[] {
  const out: SelectedOption[] = []
  for (const f of [...template.fields].sort((a, b) => a.order - b.order)) {
    if (!isVisible(f, state)) continue
    if (f.derivedFrom) {
      const text = derivedText(template, f, state)
      if (text) out.push({ label: f.cartName, value: text })
    } else if (isTextField(f)) {
      textValues(template, f, state).forEach((t, i) => {
        if (t.trim()) out.push({ label: f.repeat ? `${f.cartName} ${i + 1}` : f.cartName, value: t.trim() })
      })
    } else {
      const v = selectedValue(f, state)
      if (v) out.push({ label: f.cartName, value: v.label })
    }
  }
  return out
}

/** What the preview engine is handed: the selected value per selection field, the text per text field. */
export interface PreviewInput {
  choices: Record<number, string>
  texts: Record<number, string[]>
}

export function previewInput(template: PdpTemplate, state: OptionsState): PreviewInput {
  const input: PreviewInput = { choices: {}, texts: {} }
  for (const f of template.fields) {
    if (f.affectsPreview === false || !isVisible(f, state)) continue
    if (isTextField(f)) input.texts[f.fieldId] = textValues(template, f, state)
    else {
      const v = selectedValue(f, state)
      if (v) input.choices[f.fieldId] = v.id
    }
  }
  return input
}

/** A stable key for the preview inputs — re-render only when it changes (`affectsPreview: false` fields never do). */
export const previewKey = (input: PreviewInput) => JSON.stringify(input)
