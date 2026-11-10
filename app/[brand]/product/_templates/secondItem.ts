/**
 * The nested item on a template PDP: a second of the same product at 50% off,
 * personalized in the Quick Add panel (its own material, name and chain).
 * Built from the template's own fields, so it follows whatever the product asks.
 */
import type { QuickAddOption, QuickAddProduct } from '../../_components/QuickAddPanel'
import type { ProductItem } from '../../../../data/products'
import { parsePriceLabel } from './fieldState'
import type { PdpTemplate } from './pdpTemplate'

export const SECOND_ITEM_DISCOUNT = 0.5
export const SECOND_ITEM_TITLE = 'Add a Second Name Necklace for 50% Off'

/** The offer's heading: a name necklace says so; an initials necklace (Inez) is just "a second necklace". */
export const secondItemTitle = (template: PdpTemplate) =>
  template.fields.some((f) => f.type === 'text' && /name/i.test(f.name)) ? SECOND_ITEM_TITLE : 'Add a Second Necklace for 50% Off'

/**
 * The second necklace, built from the template's own fields. A field
 * repeated by a count (Inez's one-letter-per-initial) is one text field in
 * the panel — "Initials", as many letters as the count — split back into
 * its units for the preview. A fixed answer ("One Size") isn't asked.
 * `image`: what the panel shows — the live preview once a name is typed.
 */
export function secondItemOffer(template: PdpTemplate, product: ProductItem, image?: string | null): QuickAddProduct | null {
  const half = (cents: number) => Math.round(cents * (1 - SECOND_ITEM_DISCOUNT))

  const material = template.fields.find((f) => f.pricing === 'base')
  // The panel opens on the first material, so prices count from it
  const materialDefault = material?.values?.[0]
  const base = materialDefault ? parsePriceLabel(materialDefault.priceLabel) : product.priceInCents ?? 0

  const options: QuickAddOption[] = []
  for (const f of [...template.fields].sort((a, b) => a.order - b.order)) {
    if (f.derivedFrom || f.fixed) continue
    if (f === material && f.values) {
      options.push({
        name: f.cartName,
        type: 'material-carousel',
        label: 'Select material:',
        // Priced from the default material, each at half
        values: f.values.map((v) => ({ label: v.label, value: v.id, color: v.swatchColor, price: half(parsePriceLabel(v.priceLabel)) - half(base) })),
      })
    } else if (f.type === 'text' && f.repeat) {
      // One field for every unit: the initials typed together ("LBD")
      options.push({ name: f.cartName, label: `${f.cartName}s`.replace(/ss$/, 's'), type: 'text-input', maxLength: (f.textMaxLength ?? 1) * f.repeat.max, placeholder: f.placeholder ?? 'e.g. LBD' })
    } else if (f.type === 'text') {
      options.push({ name: f.cartName, label: f.name, type: 'text-input', maxLength: f.textMaxLength ?? undefined, placeholder: f.placeholder })
    } else if (f.values) {
      options.push({ name: f.cartName, label: f.name, type: 'dropdown', values: f.values.map((v) => ({ label: v.label, value: v.id, price: v.priceDelta ? half(v.priceDelta) : 0 })) })
    }
  }

  return {
    title: product.name,
    price: half(base),
    salePrice: base,
    currency: '$',
    rating: product.rating,
    reviewCount: product.reviewCount,
    images: [{ src: image ?? product.image, alt: product.name }],
    // Its own nested-item key, apart from the product's own url
    pdpUrl: `${product.href}#second`,
    ribbon: '50% off',
    engraving: 'fields',
    options,
  }
}

/** The panel's choices as the preview engine reads them: each field's value by field id. */
export function secondItemPreviewInput(template: PdpTemplate, selected: Record<string, string>) {
  const input: { choices: Record<number, string>; texts: Record<number, string[]> } = { choices: {}, texts: {} }
  for (const f of template.fields) {
    const v = selected[f.cartName]
    // A repeated one-character field (Inez's initials): typed together, one unit per letter
    if (f.type === 'text' && f.repeat && (f.textMaxLength ?? 1) === 1) input.texts[f.fieldId] = [...(v ?? '').replace(/\s/g, '').toUpperCase()]
    else if (f.type === 'text') input.texts[f.fieldId] = [v ?? '']
    else if (v) input.choices[f.fieldId] = v
  }
  return input
}
