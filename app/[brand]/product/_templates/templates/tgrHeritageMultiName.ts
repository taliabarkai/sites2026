import type { PdpTemplate } from '../pdpTemplate'

/**
 * TGR Heritage Multiple Name Necklace — the heavy form, on the MM flow: the
 * material on the page, then Personalize (name count, names) and Customize
 * (material, diamond size, chain length). The count also decides how many
 * diamonds there are (count − 1), which the page states but never asks.
 *
 * Material and diamond values and prices are from the live PDP screenshot
 * (Nov 2026). Base images are placeholders.
 */
export const tgrHeritageMultiName: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'tgr-heritage-multi-name',
  brand: 'tgr',
  sku: 'TGR-HERITAGE-MULTI-NAME', // TODO: real SKU
  productId: 4,
  summary: 'Two-step multi-name necklace: 2–5 names stacked, diamonds between, preview re-lays out per name',

  gallery: { desktop: 'heroGridPhotoFirst', mobile: 'carousel' },

  // Follows the MM flow: material on the page, then Personalize (the names)
  // and Customize (material again as a compact swatch row, diamond, chain).
  steps: [
    { label: 'Personalize', hint: 'Names',                      fieldIds: [203, 204, 205] },
    { label: 'Customize',   hint: 'Material, diamonds & chain', fieldIds: [201, 202, 206], display: { 201: 'visual' } },
  ],

  fields: [
    {
      fieldId: 201, name: 'Select material', cartName: 'Material', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'gold-plated',      label: 'Gold Plated',           swatchColor: '#E6C458', priceLabel: '$147' },
        { id: 'gold-vermeil',     label: 'Gold Vermeil',          swatchColor: '#E6C458', priceLabel: '$199' },
        { id: 'rose-gold-plated', label: 'Rose Gold Plated',      swatchColor: '#E8B4A0', priceLabel: '$147' },
        { id: 'solid-gold-10k',   label: '10K Solid Yellow Gold', swatchColor: '#D4AF37', priceLabel: '$612' },
      ],
    },
    {
      fieldId: 202, name: 'Select diamond size', cartName: 'Diamond', type: 'selection', displayType: 'grid', order: 2, isRequired: true,
      // Not drawn by the studio yet (stones are deferred in its HANDOFF), so no re-render
      pricing: 'delta', affectsPreview: false, defaultValueId: '0.05', showPriceDelta: false,
      tooltip: 'Carat weight per diamond. Larger stones sit slightly higher on the plate.',
      values: [
        { id: '0.05', label: '0.05CT', image: '/images/tgr/diamond-0.05.webp', priceDelta: 0 },
        { id: '0.10', label: '0.10CT', image: '/images/tgr/diamond-0.10.webp', priceDelta: 4000 },  // TODO: real deltas
        { id: '0.30', label: '0.30CT', image: '/images/tgr/diamond-0.30.webp', priceDelta: 12000 },
        { id: 'none', label: 'None',   image: '/images/tgr/diamond-none.webp', priceDelta: 0 },
      ],
    },
    {
      fieldId: 203, name: 'Select number of names (2-5)', cartName: 'Names', type: 'selection', displayType: 'visual_dropdown_list', order: 3, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '2',
      note: { text: 'Names are placed from left to right', tone: 'warning' },
      values: [
        { id: '2', label: '2 Names + 1 Diamond',  priceDelta: 0 },
        { id: '3', label: '3 Names + 2 Diamonds', priceDelta: 3000 },
        { id: '4', label: '4 Names + 3 Diamonds', priceDelta: 6000 },
        { id: '5', label: '5 Names + 4 Diamonds', priceDelta: 9000 },
      ],
    },
    {
      fieldId: 204, name: 'Name', cartName: 'Name', type: 'text', displayType: 'text', order: 4, isRequired: true,
      textMinLength: 1, textMaxLength: 10, placeholder: 'e.g. Sofia',
      pricing: 'none', affectsPreview: true,
      repeat: { countFieldId: 203, min: 2, max: 5, labelPattern: 'Name {n}' },
    },
    {
      fieldId: 205, name: 'Diamonds', cartName: 'Diamonds', type: 'selection', displayType: 'text', order: 5, isRequired: false,
      pricing: 'none', affectsPreview: false,
      derivedFrom: { fieldId: 203, label: (count) => `${count - 1} diamond${count - 1 === 1 ? '' : 's'} between the names` },
      visibleWhen: { fieldId: 202, valueIds: ['0.05', '0.10', '0.30'] },
    },
    {
      fieldId: 206, name: 'Chain length', cartName: 'Chain Length', type: 'selection', displayType: 'text', order: 6, isRequired: true,
      pricing: 'none', affectsPreview: false, defaultValueId: '18',
      values: [
        { id: '16', label: '16"' },
        { id: '18', label: '18"' },
        { id: '20', label: '20"' },
        { id: '22', label: '22"' },
      ],
    },
  ],

  livePreview: {
    enabled: true,
    // The preview is the main image: the names in the product photo until the shopper types
    galleryPlacement: 'replaceHero',
    ribbon: 'Your Personalization',
    sampleText: { 204: ['Jake', 'Emma', 'Alice', 'Sage', 'Mia'] },
    // One Carrie plate per name on one chain, from the Name Necklace Studio.
    // The studio doesn't set stones yet, so the diamonds aren't drawn.
    engine: {
      kind: 'necklaceStudio',
      textFieldId: 204,
      materialFieldId: 201,
      coatings: { 'gold-plated': 'GP', 'gold-vermeil': 'VMGP', 'rose-gold-plated': 'RGP', 'solid-gold-10k': 'GP' },
      defaultCoating: 'VMGP',
    },
  },

  flow: {
    // Only the material sits on the page before Personalize
    entryFieldIds: [201],
    entryCta: 'Personalize',
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'addToBag',
    nextCta: 'Continue to {next} →',
    stickyBar: true,
  },
}
