import type { PdpTemplate } from '../pdpTemplate'

/**
 * OAL Inez Initial Heart Necklace with Diamond — the layered preview. Metal,
 * heart color, initial, diamond on/off and diamond size all change the image,
 * so this is the template that proves the preview is state, not text.
 *
 * Step 1 holds the price-setting choices (metal, diamond); step 2 the heart
 * color, the initial and the chain. Values and prices are placeholders until
 * pulled from the live PDP (oakandluna.com/products/inez-initial-heart-necklace-with-diamond-gold-vermeil).
 */
export const oalInez: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'oal-inez',
  brand: 'oal',
  sku: 'OAL-INEZ-INITIAL-HEART', // TODO: real SKU
  productId: 9,
  summary: 'Two-step initial necklace: metal + diamond set the price, heart color + initial drive a layered preview',

  gallery: { desktop: 'stickyHero', mobile: 'carousel' },

  steps: [
    { label: 'Metal & Diamond', hint: 'Sets the price', fieldIds: [301, 302, 303] },
    { label: 'Personalize',     hint: 'Heart, initial & chain', fieldIds: [304, 305, 306] },
  ],

  fields: [
    {
      fieldId: 301, name: 'Select material', cartName: 'Material', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'sterling-silver', label: 'Sterling Silver', swatchColor: '#C9C9C9', priceLabel: '$129' },
        { id: 'gold-vermeil',    label: 'Gold Vermeil',    swatchColor: '#E6C458', priceLabel: '$169' },
        { id: 'rose-gold',       label: 'Rose Gold',       swatchColor: '#E8B4A0', priceLabel: '$169' },
      ],
    },
    {
      fieldId: 302, name: 'Diamond', cartName: 'Diamond', type: 'selection', displayType: 'visual', order: 2, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: 'with',
      values: [
        { id: 'with',    label: 'With diamond', priceDelta: 0 },
        { id: 'without', label: 'Without',      priceDelta: -3000 },
      ],
    },
    {
      fieldId: 303, name: 'Diamond size', cartName: 'Diamond Size', type: 'selection', displayType: 'grid', order: 3, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '0.05',
      visibleWhen: { fieldId: 302, valueIds: ['with'] },
      values: [
        { id: '0.05', label: '0.05CT', image: '/images/oal/diamond-0.05.png', priceDelta: 0 },
        { id: '0.10', label: '0.10CT', image: '/images/oal/diamond-0.10.png', priceDelta: 4000 },
      ],
    },
    {
      fieldId: 304, name: 'Heart color', cartName: 'Heart', type: 'selection', displayType: 'visual', order: 4, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'red',
      values: [
        { id: 'red',   label: 'Red',   swatchColor: '#B3202B' },
        { id: 'pink',  label: 'Pink',  swatchColor: '#E89AB0' },
        { id: 'white', label: 'White', swatchColor: '#F4F1EC' },
        { id: 'black', label: 'Black', swatchColor: '#1F1F1F' },
      ],
    },
    {
      fieldId: 305, name: 'Initial', cartName: 'Initial', type: 'text', displayType: 'text', order: 5, isRequired: true,
      textMinLength: 1, textMaxLength: 1, placeholder: 'A',
      pricing: 'none', affectsPreview: true,
    },
    {
      fieldId: 306, name: 'Chain length', cartName: 'Chain Length', type: 'selection', displayType: 'text', order: 6, isRequired: true,
      pricing: 'none', affectsPreview: false, defaultValueId: '16',
      values: [
        { id: '16', label: '16"' },
        { id: '18', label: '18"' },
        { id: '20', label: '20"' },
      ],
    },
  ],

  livePreview: {
    enabled: true,
    galleryPlacement: 'replaceHero',
    ribbon: 'Live Preview',
    disclaimer: 'Preview is approximate',
    engine: {
      kind: 'placeholder',
      spec: {
        base: {
          fieldId: 301,
          images: {
            'sterling-silver': '/images/oal/preview/inez-silver.png',
            'gold-vermeil':    '/images/oal/preview/inez-gold.png',
            'rose-gold':       '/images/oal/preview/inez-rose.png',
          },
        },
        overlays: [
          { fieldId: 304, images: { red: '/images/oal/preview/heart-red.png', pink: '/images/oal/preview/heart-pink.png', white: '/images/oal/preview/heart-white.png', black: '/images/oal/preview/heart-black.png' }, box: { x: 0.36, y: 0.40, w: 0.28, h: 0.26 } },
          { fieldId: 303, images: { '0.05': '/images/oal/preview/dia-s.png', '0.10': '/images/oal/preview/dia-m.png' }, box: { x: 0.56, y: 0.38, w: 0.08, h: 0.08 } },
        ],
        text: [
          { fieldId: 305, font: "'Cormorant Garamond', serif", box: { x: 0.44, y: 0.45, w: 0.12, h: 0.14 }, uppercase: true },
        ],
      },
    },
  },

  flow: {
    entryCta: 'Personalize',
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'addToBag',
    nextCta: 'Continue to {next}',
    stickyBar: true,
  },
}
