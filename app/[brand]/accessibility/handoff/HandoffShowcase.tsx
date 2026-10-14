'use client'

import type { BrandKey } from '../../_config/brands'
import { TextFieldCard } from '../_showcase/FormFieldCards'
import { FieldWithButtonCard } from '../_showcase/FieldWithButton'
import { MaterialSelectorCard } from '../_showcase/handoff'
import { ColorSwatchCard } from '../_showcase/variants/VariantCards'
import { SearchFieldCard } from '../_showcase/SearchFieldCard'
import type { ShowcaseSection } from '../_showcase/sections'
import { ShowcaseShell } from '../_showcase/ShowcaseShell'

// The first handoff: the text field (plain, search, and with a button), the
// material selector and the color swatches. Same components as the full page, so the two never drift.

// One entry per card; the ids are the cards' own, so the contents links open them.
const SECTIONS: ShowcaseSection[] = [
  { id: 'text-field', title: 'Text field', intro: '', planned: [] },
  { id: 'search-field', title: 'Search field', intro: '', planned: [] },
  { id: 'field-with-button', title: 'Text field with button', intro: '', planned: [] },
  { id: 'material-selector', title: 'Material selector', intro: '', planned: [] },
  { id: 'color-swatches', title: 'Color swatches', intro: '', planned: [] },
]

const CARDS = {
  'text-field': <TextFieldCard />,
  'search-field': <SearchFieldCard />,
  'field-with-button': <FieldWithButtonCard />,
  'material-selector': <MaterialSelectorCard />,
  'color-swatches': <ColorSwatchCard />,
}

export function HandoffShowcase({ brand }: { brand: BrandKey }) {
  return (
    <ShowcaseShell
      brand={brand}
      path="accessibility/handoff"
      title="Accessibility handoff"
      lead="The text field, the material selector and the color swatches, meeting WCAG 2.2 Level AA in every brand. Each card shows the fix; switch to Before in the top bar to see production as it is today."
      sections={SECTIONS}
      cards={CARDS}
      sectionHeadings={false}
      expandControls={false}
    />
  )
}
