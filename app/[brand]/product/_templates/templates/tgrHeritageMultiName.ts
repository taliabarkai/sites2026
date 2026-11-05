import type { PdpTemplate } from '../pdpTemplate'

/**
 * TGR Heritage Multiple Name Necklace — the heavy form. Material and diamond
 * size set the price and stay in step 1; the name count, the names and the
 * chain length are step 2. The count also decides how many diamonds there are
 * (count − 1), which the page states but never asks.
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

  gallery: { desktop: 'grid', mobile: 'carousel' },

  steps: [
    { label: 'Design',  hint: 'Material & diamonds', fieldIds: [201, 202] },
    { label: 'Names',   hint: 'Names & chain',       fieldIds: [203, 204, 205, 206] },
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
      pricing: 'delta', affectsPreview: true, defaultValueId: '0.05',
      tooltip: 'Carat weight per diamond. Larger stones sit slightly higher on the plate.',
      values: [
        { id: '0.05', label: '0.05CT', image: '/images/tgr/diamond-0.05.png', priceDelta: 0 },
        { id: '0.10', label: '0.10CT', image: '/images/tgr/diamond-0.10.png', priceDelta: 4000 },  // TODO: real deltas
        { id: '0.30', label: '0.30CT', image: '/images/tgr/diamond-0.30.png', priceDelta: 12000 },
        { id: 'none', label: 'None',   priceDelta: 0 },
      ],
    },
    {
      fieldId: 203, name: 'Select number of names (2-5)', cartName: 'Names', type: 'selection', displayType: 'visual_dropdown_list', order: 3, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '2',
      note: { text: 'Names are placed from left to right', tone: 'warning' },
      helpLink: 'Inscriptions Guide',
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
    galleryPlacement: 'first',
    ribbon: 'Live Preview',
    disclaimer: 'Preview is approximate',
    engine: {
      kind: 'placeholder',
      spec: {
        base: {
          fieldId: 201,
          images: {
            'gold-plated':      '/images/tgr/preview/heritage-gold.png',
            'gold-vermeil':     '/images/tgr/preview/heritage-gold.png',
            'rose-gold-plated': '/images/tgr/preview/heritage-rose.png',
            'solid-gold-10k':   '/images/tgr/preview/heritage-gold.png',
          },
        },
        // One line per name, left to right along the chain, diamonds drawn between.
        text: [
          { fieldId: 204, font: "'Pinyon Script', cursive", box: { x: 0.12, y: 0.44, w: 0.76, h: 0.12 }, layout: 'stack' },
        ],
        overlays: [
          { fieldId: 202, images: { '0.05': '/images/tgr/preview/dia-s.png', '0.10': '/images/tgr/preview/dia-m.png', '0.30': '/images/tgr/preview/dia-l.png' }, box: { x: 0.12, y: 0.44, w: 0.76, h: 0.12 } },
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
