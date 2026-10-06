'use client'

import type { BrandKey } from '../_config/brands'
import {
  ButtonVariantsCard,
  DisabledButtonCard,
  IconButtonsCard,
  InlineLinksCard,
  LoadingButtonCard,
  ToggleButtonCard,
} from './_showcase/buttons'
import { ContrastCard } from './_showcase/ContrastCard'
import { FieldWithButtonCard } from './_showcase/FieldWithButton'
import { FocusRingCard } from './_showcase/FocusRingCard'
import {
  CheckboxCard,
  ComboboxCard,
  CounterFieldCard,
  ErrorSummaryCard,
  RadioGroupCard,
  SelectCard,
  SwitchCard,
  TextFieldCard,
  TextareaCard,
} from './_showcase/FormFieldCards'
import {
  AccordionCard,
  BreadcrumbsCard,
  CarouselCard,
  DrawerCard,
  ModalCard,
  PaginationCard,
  TabsCard,
  TooltipCard,
} from './_showcase/nav'
import { ReflowCard } from './_showcase/ReflowCard'
import { SearchFieldCard } from './_showcase/SearchFieldCard'
import { TargetSizeCard } from './_showcase/TargetSizeCard'
import {
  BorderComparisonCard,
  ColorSwatchCard,
  ImageSwatchCard,
  TextChipCard,
  TileCard,
} from './_showcase/variants/VariantCards'
import { SHOWCASE_SECTIONS } from './_showcase/sections'
import { ShowcaseShell } from './_showcase/ShowcaseShell'

// Cards built so far, by section. Everything else in a section's `planned`
// list renders as "coming next" until it exists.
const SECTION_CARDS: Record<string, React.ReactNode> = {
  foundations: (
    <>
      <ContrastCard />
      <FocusRingCard />
      <TargetSizeCard />
      <ReflowCard />
    </>
  ),
  'form-fields': (
    <>
      <TextFieldCard />
      <CounterFieldCard />
      <TextareaCard />
      <SelectCard />
      <ComboboxCard />
      <CheckboxCard />
      <RadioGroupCard />
      <SwitchCard />
      <ErrorSummaryCard />
    </>
  ),
  search: (
    <>
      <SearchFieldCard />
      <FieldWithButtonCard />
    </>
  ),
  'buttons-links': (
    <>
      <ButtonVariantsCard />
      <IconButtonsCard />
      <LoadingButtonCard />
      <DisabledButtonCard />
      <InlineLinksCard />
      <ToggleButtonCard />
    </>
  ),
  'product-variants': (
    <>
      <BorderComparisonCard />
      <ColorSwatchCard />
      <ImageSwatchCard />
      <TextChipCard />
      <TileCard />
    </>
  ),
  'navigation-overlays': (
    <>
      <CarouselCard />
      <ModalCard />
      <DrawerCard />
      <AccordionCard />
      <TabsCard />
      <BreadcrumbsCard />
      <PaginationCard />
      <TooltipCard />
    </>
  ),
}

export function AccessibilityShowcase({ brand }: { brand: BrandKey }) {
  return (
    <ShowcaseShell
      brand={brand}
      path="accessibility"
      title="Accessibility"
      lead="Every interactive component in the design system, in each of its states, meeting WCAG 2.2 Level AA. Each card shows the proposed fix, and the Before view in the top bar shows production as it is today."
      sections={SHOWCASE_SECTIONS}
      cards={SECTION_CARDS}
    />
  )
}
