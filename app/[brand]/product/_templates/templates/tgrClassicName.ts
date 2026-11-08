import type { PdpTemplate } from '../pdpTemplate'

/**
 * TGR Classic Cocktail Name Necklace — the short form. Three fields, so no
 * steps: everything sits on the page and the preview redraws per keystroke.
 *
 * Prices, max length and the base images are placeholders until pulled from
 * the live product (theograce.com/products/classic-cocktail-name-necklace-in-gold-finish).
 */
export const tgrClassicName: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'tgr-classic-name',
  brand: 'tgr',
  // IB and MNN share TGR's catalog in the mockup, so they get Carrie too
  alsoOn: ['ib', 'mnn'],
  sku: 'TGR-CLASSIC-COCKTAIL-NAME', // TODO: real SKU
  productId: 5,
  summary: 'Single-step name necklace: metal, name, chain length — preview updates as you type',

  gallery: { desktop: 'heroGridPhotoFirst', mobile: 'carousel', badges: ['15% off'] },
  sale: { percent: 15 },

  steps: [
    { label: 'Personalize', fieldIds: [101, 102, 103] },
  ],

  fields: [
    {
      fieldId: 101, name: 'Select material', cartName: 'Material', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'sterling-silver',  label: 'Sterling Silver',      swatchColor: '#C9C9C9', priceLabel: '$90' },
        { id: 'gold-plated',      label: 'Gold Plated',          swatchColor: '#E6C458', priceLabel: '$147' },
        { id: 'gold-vermeil',     label: 'Gold Vermeil',         swatchColor: '#E6C458', priceLabel: '$199' },
        { id: 'solid-gold-10k',   label: '10K Solid Yellow Gold', swatchColor: '#D4AF37', priceLabel: '$612' },
      ],
    },
    {
      fieldId: 102, name: 'Your name', cartName: 'Name', type: 'text', displayType: 'text', order: 2, isRequired: true,
      textMinLength: 1, textMaxLength: 12, placeholder: 'e.g. Carrie',
      pricing: 'none', affectsPreview: true,
    },
    {
      fieldId: 103, name: 'Chain length', cartName: 'Chain Length', type: 'selection', displayType: 'text', order: 3, isRequired: true,
      pricing: 'none', affectsPreview: false, defaultValueId: '16',
      values: [
        { id: '14', label: '14"' },
        { id: '16', label: '16"' },
        { id: '18', label: '18"' },
        { id: '20', label: '20"' },
      ],
    },
  ],

  livePreview: {
    enabled: true,
    // The preview is the main image: "Carrie" (as in the product photo) until the shopper types
    galleryPlacement: 'replaceHero',
    ribbon: 'Your Personalization',
    sampleText: { 102: ['Carrie'] },
    // The Carrie plate from the Name Necklace Studio, in the material's plating
    engine: {
      kind: 'necklaceStudio',
      textFieldId: 102,
      materialFieldId: 101,
      coatings: { 'sterling-silver': 'SR', 'gold-plated': 'GP', 'gold-vermeil': 'VMGP', 'solid-gold-10k': 'GP' },
      defaultCoating: 'VMGP',
    },
  },

  flow: {
    container: { desktop: 'inline', mobile: 'inline' },
    personalizeRow: { title: 'Personalize Yours', description: 'See your name in our signature script' },
    completion: 'addToBag',
    stickyBar: true,
  },
}
