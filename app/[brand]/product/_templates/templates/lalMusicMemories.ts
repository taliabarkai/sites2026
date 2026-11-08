import type { PdpTemplate } from '../pdpTemplate'

/**
 * LAL Music Memories Custom Canvas — the shipped POC, written back into the
 * schema. Field ids 1–9 are placeholders; in production they are the global
 * catalog field ids for SKU 100-35-10251-62.
 *
 * Flow as it ships: song + artist on the page → "See how it looks" → two
 * tabs (Personalize / Frame Options) in a card on desktop, a slide-in panel
 * with the preview on top on mobile → "My Personalization" summary → Add to bag.
 */
export const lalMusicMemories: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'lal-music-memories',
  brand: 'lal',
  sku: '100-35-10251-62',
  productId: 1,
  summary: 'Two-step canvas customizer with a composited live preview (shipped POC)',
  // MusicMemoriesCustomizer still draws this page; the template documents it.
  renderer: 'bespoke',

  gallery: { desktop: 'sideScroll', mobile: 'carousel' },

  steps: [
    { label: 'Personalize', hint: 'Song, names & date', fieldIds: [1, 2, 3, 4, 5] },
    { label: 'Frame Options', hint: 'Size, color & material', fieldIds: [6, 7, 8] },
  ],

  fields: [
    { fieldId: 1, name: 'Pick your song', cartName: 'Song', type: 'text', displayType: 'text', order: 1, isRequired: true, textMaxLength: 40, placeholder: 'e.g. Yellow', pricing: 'none', affectsPreview: true },
    { fieldId: 2, name: 'Name the artist', cartName: 'Artist', type: 'text', displayType: 'text', order: 2, isRequired: false, textMaxLength: 40, placeholder: 'e.g. Coldplay', pricing: 'none', affectsPreview: false },
    { fieldId: 3, name: "What's the occasion?", cartName: 'Memory', type: 'text', displayType: 'text', order: 3, isRequired: false, textMaxLength: 40, placeholder: 'e.g. Our Wedding Song', pricing: 'none', affectsPreview: true },
    { fieldId: 4, name: 'Add Names or special date', cartName: 'Names/Date', type: 'text', displayType: 'text', order: 4, isRequired: false, textMaxLength: 40, placeholder: 'e.g. Alex & Max, 10.10.2021', pricing: 'none', affectsPreview: true },
    {
      fieldId: 5, name: 'Color of the center', cartName: 'Color', type: 'selection', displayType: 'visual', order: 5, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'orange',
      values: [
        { id: 'purple', label: 'Purple', swatchColor: '#A46C93', hint: '(Most Popular)' },
        { id: 'orange', label: 'Orange', swatchColor: '#DC7957' },
        { id: 'blue',   label: 'Blue',   swatchColor: '#57BADD' },
        { id: 'green',  label: 'Green',  swatchColor: '#91A36B' },
      ],
    },
    {
      fieldId: 6, name: 'Material', cartName: 'Frame', type: 'selection', displayType: 'visual_dropdown_list', order: 6, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: 'canvas',
      values: [
        { id: 'canvas',  label: 'Canvas',  image: '/images/lal/music-memories/Canvas.png',  priceDelta: 0 },
        { id: 'metal',   label: 'Metal',   image: '/images/lal/music-memories/Metal.png',   priceDelta: 7500 },
        { id: 'acrylic', label: 'Acrylic', image: '/images/lal/music-memories/Acrylic.png', priceDelta: 11500 },
      ],
    },
    {
      fieldId: 7, name: 'Frame color', cartName: 'Frame color', type: 'selection', displayType: 'visual', order: 7, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'black',
      visibleWhen: { fieldId: 6, valueIds: ['canvas'] },
      values: [
        { id: 'white',      label: 'White',      swatchColor: '#FFFFFF' },
        { id: 'black',      label: 'Black',      swatchColor: '#1F1F1F' },
        { id: 'wood-light', label: 'Light wood', swatchColor: '#D4A574' },
        { id: 'wood-dark',  label: 'Dark wood',  swatchColor: '#5C4033' },
      ],
    },
    {
      fieldId: 8, name: 'Choose size', cartName: 'Size', type: 'selection', displayType: 'text', order: 8, isRequired: true,
      pricing: 'base', affectsPreview: false, defaultValueId: '12x16', helpLink: 'Size guide',
      values: [
        { id: '9x12',  label: 'XS – 9" x 12"',  priceLabel: '$50' },
        { id: '12x16', label: 'S – 12" x 16"',  priceLabel: '$75' },
        { id: '18x24', label: 'M – 18" x 24"',  priceLabel: '$120' },
        { id: '24x32', label: 'L – 24" x 32"',  priceLabel: '$145' },
        { id: '30x40', label: 'XL – 30" x 40"', priceLabel: '$190' },
      ],
    },
  ],

  livePreview: {
    enabled: true,
    galleryPlacement: 'first',
    ribbon: 'Your Personalization',
    engine: {
      kind: 'placeholder',
      spec: {
        // The frame mockup is the base; it swaps by frame color (canvas) or material.
        base: {
          fieldId: 7,
          images: {
            white: '/images/lal/frame-colors/White.jpg',
            black: '/images/lal/frame-colors/Black.jpg',
            'wood-light': '/images/lal/frame-colors/LightWood.jpg',
            'wood-dark': '/images/lal/frame-colors/DarkWood.jpg',
          },
        },
        // MM draws its own vinyl SVG into the frame window; the text layers
        // below are the equivalent in schema terms (song title centered, memory
        // and names below). The real renderer stays in MusicMemoriesCustomizer.
        text: [
          { fieldId: 1, font: "'EB Garamond', serif", box: { x: 0.2065, y: 0.45, w: 0.584, h: 0.1 }, uppercase: true },
          { fieldId: 3, font: "'EB Garamond', serif", box: { x: 0.2065, y: 0.74, w: 0.584, h: 0.05 } },
          { fieldId: 4, font: "'Pinyon Script', cursive", box: { x: 0.2065, y: 0.80, w: 0.584, h: 0.06 } },
        ],
      },
    },
  },

  flow: {
    entryFieldIds: [1, 2],
    entryCta: 'See how it looks',
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'summary',
    nextCta: 'Continue to {next}',
    stickyBar: false,
  },

  addons: [
    { id: 'slipmat', title: 'Music Memories Custom Slipmat', image: '/images/lal/music-memories/slipmat-upsell.png', price: 1500, originalPrice: 3000, badge: '50% OFF' },
  ],
}
