import type { PdpTemplate } from '../pdpTemplate'

/**
 * OAL Inez Initial Heart Necklace With Premium Diamond — four pieces on one
 * chain: an initial, an enamel heart, a diamond and a zodiac coin.
 *
 * Opens on V5 (Jewelry): the finish on the page; Personalize holds what makes
 * it theirs — the initial (an open grid of letter tiles) and the zodiac sign
 * (an open grid of sign tiles); Customize the rest — the diamond's size, the heart's color, the
 * diamond's shape (each cut drawn, named under it) and the size, stated
 * (16" + 2", one size). 15% off every finish.
 *
 * Finish prices are the live PDP's sale prices worked back (Nov 2026: $187 /
 * $221 / $510 at 15% off). The 0.3 ct upgrade is a placeholder.
 */
const ZODIAC: { id: string; glyph: string; label: string }[] = [
  { id: 'aries',       glyph: '♈', label: 'Aries (March 21 - April 19)' },
  { id: 'taurus',      glyph: '♉', label: 'Taurus (April 20 - May 20)' },
  { id: 'gemini',      glyph: '♊', label: 'Gemini (May 21 - June 20)' },
  { id: 'cancer',      glyph: '♋', label: 'Cancer (June 21 - July 22)' },
  { id: 'leo',         glyph: '♌', label: 'Leo (July 23 - August 22)' },
  { id: 'virgo',       glyph: '♍', label: 'Virgo (August 23 - September 22)' },
  { id: 'libra',       glyph: '♎', label: 'Libra (September 23 - October 22)' },
  { id: 'scorpio',     glyph: '♏', label: 'Scorpio (October 23 - November 21)' },
  { id: 'sagittarius', glyph: '♐', label: 'Sagittarius (November 22 - December 21)' },
  { id: 'capricorn',   glyph: '♑', label: 'Capricorn (December 22 - January 19)' },
  { id: 'aquarius',    glyph: '♒', label: 'Aquarius (January 20 - February 18)' },
  { id: 'pisces',      glyph: '♓', label: 'Pisces (February 19 - March 20)' },
]

export const oalInezHeartPremium: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'oal-inez-heart-premium',
  brand: 'oal',
  sku: 'OAL-INEZ-HEART-PREMIUM-DIAMOND', // TODO: real SKU
  productId: 27,
  summary: 'Initial, enamel heart, premium diamond and zodiac coin on one chain; 15% off',

  gallery: { desktop: 'heroGridPhotoFirst', mobile: 'carousel' },
  sale: { percent: 15 },

  // V1–V4's one step: every field in page order (the finish stays on the page
  // behind the Personalize row). V5, its default, has its own tabs: flow.jewelrySteps.
  steps: [
    { label: 'Personalize', hint: 'Initial, zodiac & diamond', fieldIds: [401, 402, 403, 404, 405, 406] },
  ],

  fields: [
    {
      // OAL's metals, as solid swatches; no rose gold
      fieldId: 400, name: 'Select finish', cartName: 'Finish', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'sterling-silver', label: 'Silver',            swatchColor: '#C8C8C8', priceLabel: '$220' },
        { id: 'gold-vermeil',    label: '18K Gold Vermeil',  swatchColor: '#E9DE8C', priceLabel: '$260' },
        { id: 'solid-gold-10k',  label: '10K Yellow Gold',   swatchColor: '#D5C484', priceLabel: '$600' },
      ],
    },
    {
      // The initial: one letter, from an open grid of square tiles
      fieldId: 401, name: 'Initial', cartName: 'Initial', type: 'text', displayType: 'text', order: 2, isRequired: true,
      textMinLength: 1, textMaxLength: 1,
      letterChoices: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], letterLayout: 'grid',
      pricing: 'none', affectsPreview: true,
    },
    {
      // An open grid of text tiles: the sign and its name ("♋ Cancer")
      fieldId: 402, name: 'Zodiac sign', cartName: 'Zodiac Sign', type: 'selection', displayType: 'grid', order: 3, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'cancer',
      values: ZODIAC.map((z) => ({ id: z.id, label: `${z.glyph}\uFE0E ${z.label.replace(/ \(.*\)$/, '')}` })),
    },
    {
      // Text tiles; the price moves, the tiles don't show it
      fieldId: 403, name: 'Select diamond size', cartName: 'Diamond Size', type: 'selection', displayType: 'grid', order: 4, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '0.03', showPriceDelta: false,
      values: [
        { id: '0.03', label: '0.03 ct', priceDelta: 0 },
        { id: '0.3',  label: '0.3 ct',  priceDelta: 10000 }, // TODO: real upgrade price
      ],
    },
    {
      // Heart icons in each enamel, named beside the label ("Heart color — Red")
      fieldId: 404, name: 'Heart color', cartName: 'Heart Color', type: 'selection', displayType: 'visual', order: 5, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'red',
      values: [
        { id: 'red',   label: 'Red',   image: '/images/charms/inez/heart-red.svg' },
        { id: 'black', label: 'Black', image: '/images/charms/inez/heart-black.svg' },
      ],
    },
    {
      // Each cut drawn, its name under it
      fieldId: 405, name: 'Diamond shape', cartName: 'Diamond Shape', type: 'selection', displayType: 'grid', order: 6, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'round',
      values: [
        { id: 'round',   label: 'Round',   image: '/images/charms/inez/cut-round.svg' },
        { id: 'oval',    label: 'Oval',    image: '/images/charms/inez/cut-oval.svg' },
        { id: 'emerald', label: 'Emerald', image: '/images/charms/inez/cut-emerald.svg' },
      ],
    },
    {
      // One size: stated, not asked
      fieldId: 406, name: 'Size', cartName: 'Size', type: 'selection', displayType: 'text', order: 7, isRequired: true,
      pricing: 'none', affectsPreview: false, defaultValueId: 'one-size', fixed: true,
      values: [{ id: 'one-size', label: '16" + 2" (One Size)' }],
    },
  ],

  livePreview: {
    enabled: true,
    galleryPlacement: 'first',
    ribbon: 'Your Personalization',
    // Before the shopper picks a letter: a T
    sampleText: { 401: ['T'] },
    engine: {
      kind: 'placeholder',
      spec: {
        base: {
          fieldId: 400,
          images: {
            'sterling-silver': '/images/oal/preview/inez-heart-silver.png',
            'gold-vermeil':    '/images/oal/preview/inez-heart-gold.png',
            'solid-gold-10k':  '/images/oal/preview/inez-heart-10k.png',
          },
        },
        chain: { style: 'cable' },
        // The four pieces in the product's order: initial, heart, diamond, zodiac coin
        charms: {
          font: "'Cormorant Garamond', serif",
          box: { x: 0.14, y: 0.6, w: 0.72, h: 0.14 },
          pieces: [
            { kind: 'letters', fieldId: 401 },
            { kind: 'heart', fieldId: 404, colors: { red: '#C8102E', black: '#1C1C1C' } },
            {
              kind: 'stone', fieldId: 405,
              stones: { round: { cut: 'round' }, oval: { cut: 'oval' }, emerald: { cut: 'emerald' } },
              size: { fieldId: 403, scale: { '0.03': 0.8, '0.3': 1.25 } },
            },
            { kind: 'coin', fieldId: 402, glyphs: Object.fromEntries(ZODIAC.map((z) => [z.id, z.glyph])) },
          ],
        },
      },
    },
  },

  flow: {
    // V5 (Jewelry) unless the link names another version
    defaultPlacement: 'jewelry',
    // V5's tabs: Personalize — what makes it theirs — then Customize, the
    // stone, the heart and the (stated) size
    jewelrySteps: [
      { label: 'Personalize', fieldIds: [401, 402] },
      { label: 'Customize',   fieldIds: [403, 404, 405, 406] },
    ],
    entryFieldIds: [400],
    entryCta: 'Personalize',
    personalizeRow: { title: 'Personalize Yours', description: 'Choose your initial and zodiac sign' },
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'addToBag',
    nextCta: 'Continue to {next}',
    stickyBar: true,
  },
}
