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
  sku: 'TGR-CLASSIC-COCKTAIL-NAME', // TODO: real SKU
  productId: 5,
  summary: 'Single-step name necklace: metal, name, chain length — preview updates as you type',

  gallery: { desktop: 'grid', mobile: 'carousel' },

  steps: [
    { label: 'Personalize', fieldIds: [101, 102, 103] },
  ],

  fields: [
    {
      fieldId: 101, name: 'Select material', cartName: 'Material', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'gold-plated',      label: 'Gold Plated',          swatchColor: '#E6C458', priceLabel: '$147' },
        { id: 'gold-vermeil',     label: 'Gold Vermeil',         swatchColor: '#E6C458', priceLabel: '$199' },
        { id: 'rose-gold-plated', label: 'Rose Gold Plated',     swatchColor: '#E8B4A0', priceLabel: '$147' },
        { id: 'solid-gold-10k',   label: '10K Solid Yellow Gold', swatchColor: '#D4AF37', priceLabel: '$612' },
      ],
    },
    {
      fieldId: 102, name: 'Your name', cartName: 'Name', type: 'text', displayType: 'text', order: 2, isRequired: true,
      textMinLength: 1, textMaxLength: 12, placeholder: 'e.g. Sofia',
      pricing: 'none', affectsPreview: true, helpLink: 'Inscriptions Guide',
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
    galleryPlacement: 'first',
    ribbon: 'Live Preview',
    disclaimer: 'Preview is approximate',
    engine: {
      kind: 'placeholder',
      spec: {
        base: {
          fieldId: 101,
          images: {
            'gold-plated':      '/images/tgr/preview/classic-name-gold.png',
            'gold-vermeil':     '/images/tgr/preview/classic-name-gold.png',
            'rose-gold-plated': '/images/tgr/preview/classic-name-rose.png',
            'solid-gold-10k':   '/images/tgr/preview/classic-name-gold.png',
          },
        },
        text: [
          { fieldId: 102, font: "'Pinyon Script', cursive", box: { x: 0.25, y: 0.42, w: 0.5, h: 0.16 }, layout: 'single' },
        ],
      },
    },
  },

  flow: {
    container: { desktop: 'inline', mobile: 'inline' },
    completion: 'addToBag',
    stickyBar: true,
  },
}
