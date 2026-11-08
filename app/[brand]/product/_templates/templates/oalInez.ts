import type { PdpTemplate } from '../pdpTemplate'

/**
 * OAL Inez Initial Necklace — the layered preview. The finish, the initials
 * and the stone all change the image, so this is the template that proves
 * the preview is state, not text.
 *
 * Opens on V5 (Jewelry): the finish (OAL's word for the metal) on the page;
 * then Personalize — how many initials (a carousel of text tiles, 1–5,
 * each after the first +$25), the initials typed in one field (exactly that
 * many letters, each one a piece on the chain in the preview) and the chain
 * length, stated (one size) — and Customize: the stone (a diamond by
 * default — its size, then its shape — a gemstone: ruby, emerald or black
 * moissanite — or none; a stone adds $30), set between the initials or beside a single one,
 * then Add to bag. Initials come first: how many there are decides how many
 * stones the necklace has. Values and prices are placeholders until
 * pulled from the live PDP (oakandluna.com/products/inez-initial-heart-necklace-with-diamond-gold-vermeil).
 */
export const oalInez: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'oal-inez',
  brand: 'oal',
  sku: 'OAL-INEZ-INITIAL-HEART', // TODO: real SKU
  productId: 9,
  summary: 'Initial necklace on V5: how many initials (1–5), the initials in one field, then no stone, a gemstone or a diamond',

  gallery: { desktop: 'heroGridPhotoFirst', mobile: 'carousel' },

  // V1–V4's one step: every field, in page order. Behind the Personalize row
  // (V1, V4) the finish stays on the page (flow.entryFieldIds);
  // on the page (V2, V3) they all show here. V5, its default, has its own
  // tabs: flow.jewelrySteps.
  steps: [
    { label: 'Personalize', hint: 'Initials & stone', fieldIds: [301, 307, 305, 306, 302, 310, 303, 311] },
  ],

  fields: [
    {
      // OAL calls the metal its finish
      fieldId: 301, name: 'Select finish', cartName: 'Finish', type: 'selection', displayType: 'carousel', order: 1, isRequired: true,
      pricing: 'base', affectsPreview: true, defaultValueId: 'gold-vermeil',
      values: [
        { id: 'sterling-silver', label: 'Sterling Silver', swatchColor: '#C9C9C9', priceLabel: '$129' },
        { id: 'gold-vermeil',    label: 'Gold Vermeil',    swatchColor: '#E6C458', priceLabel: '$169' },
        { id: 'rose-gold',       label: 'Rose Gold',       swatchColor: '#E8B4A0', priceLabel: '$169' },
      ],
    },
    {
      // How many initials, as a carousel of text tiles: the field below takes
      // exactly that many letters. The first is in the price; each one after
      // adds $25 — the price moves, the tiles don't show it
      fieldId: 307, name: 'Select number of initials (1-5)', cartName: 'Number of Initials', type: 'selection', displayType: 'carousel', order: 2, isRequired: true,
      pricing: 'delta', affectsPreview: false, defaultValueId: '1', showPriceDelta: false,
      values: [
        { id: '1', label: '1 initial',  priceDelta: 0 },
        { id: '2', label: '2 initials', priceDelta: 2500 },
        { id: '3', label: '3 initials', priceDelta: 5000 },
        { id: '4', label: '4 initials', priceDelta: 7500 },
        { id: '5', label: '5 initials', priceDelta: 10000 },
      ],
    },
    {
      // The initials, in one field: letters only, in capitals, as many as
      // chosen above
      fieldId: 305, name: 'Your initials', cartName: 'Initials', type: 'text', displayType: 'text', order: 3, isRequired: true,
      textMinLength: 1, textMaxLength: 5, placeholder: 'e.g. LBD', lettersOnly: true, uppercase: true, lengthFrom: 307,
      pricing: 'none', affectsPreview: true,
    },
    {
      // One size: stated, not asked
      fieldId: 306, name: 'Chain length', cartName: 'Chain Length', type: 'selection', displayType: 'text', order: 4, isRequired: true,
      pricing: 'none', affectsPreview: false, defaultValueId: 'one-size', fixed: true,
      values: [{ id: 'one-size', label: 'One Size' }],
    },
    {
      // The stone set between the initials — each kind then shows its own choices
      fieldId: 302, name: 'Stone', cartName: 'Stone', type: 'selection', displayType: 'grid', order: 4, isRequired: true,
      // A diamond unless the shopper picks otherwise
      pricing: 'delta', affectsPreview: true, defaultValueId: 'diamond', showPriceDelta: false,
      values: [
        // The finish's price is the necklace without a stone; a stone adds $30
        { id: 'diamond',  label: 'Diamond',  priceDelta: 3000 },
        { id: 'gemstone', label: 'Gemstone', priceDelta: 3000 },
        { id: 'none',     label: 'No stone', priceDelta: 0 },
      ],
    },
    {
      // Gem swatches, named beside the label ("Gemstone — Ruby")
      fieldId: 310, name: 'Gemstone', cartName: 'Gemstone', type: 'selection', displayType: 'visual', order: 5, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'ruby',
      visibleWhen: { fieldId: 302, valueIds: ['gemstone'] },
      values: [
        { id: 'ruby',             label: 'Ruby',             image: '/images/birthstones/july-ruby.png' },
        { id: 'emerald',          label: 'Emerald',          image: '/images/birthstones/may-emerald.png' },
        { id: 'black-moissanite', label: 'Black Moissanite', image: '/images/gems/black-moissanite.png' },
      ],
    },
    {
      // The diamond's shape (after its size) — text tiles (no pictures)
      fieldId: 311, name: 'Shape', cartName: 'Diamond Shape', type: 'selection', displayType: 'grid', order: 7, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'round',
      visibleWhen: { fieldId: 302, valueIds: ['diamond'] },
      values: [
        { id: 'round',   label: 'Round' },
        { id: 'oval',    label: 'Oval' },
        { id: 'emerald', label: 'Emerald cut' },
      ],
    },
    {
      fieldId: 303, name: 'Size', cartName: 'Diamond Size', type: 'selection', displayType: 'grid', order: 6, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '0.05', showPriceDelta: false,
      visibleWhen: { fieldId: 302, valueIds: ['diamond'] },
      values: [
        { id: '0.05', label: '0.05ct', priceDelta: 0 },
        { id: '0.10', label: '0.10ct', priceDelta: 4000 },
      ],
    },
  ],

  livePreview: {
    enabled: true,
    galleryPlacement: 'first',
    ribbon: 'Your Personalization',
    // Before the shopper types: sample initials for the count chosen — 1: A,
    // 2: OL, 3: OAL, 4: OAKL, 5: OAKLU
    sampleText: { 305: ['A', 'OL', 'OAL', 'OAKL', 'OAKLU'] },
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
        chain: { style: 'cable' },
        text: [
          {
            // Strung on the drawn necklace: the box's top is the necklace's lowest point, its height the letters' size
            fieldId: 305, font: "'Cormorant Garamond', serif", box: { x: 0.14, y: 0.6, w: 0.72, h: 0.14 }, uppercase: true, perCharacter: true,
            // The stone on the chain between the initials (beside a single
            // one): the gemstone's picture, or the diamond's cut (scaled by
            // its carat). Without a stone neither field is in the preview.
            separator: {
              sources: [
                { fieldId: 310, stones: {
                  ruby:               { image: '/images/birthstones/july-ruby.png' },
                  'black-moissanite': { image: '/images/gems/black-moissanite.png' },
                  emerald:            { image: '/images/birthstones/may-emerald.png' },
                } },
                { fieldId: 311, stones: { round: { cut: 'round' }, oval: { cut: 'oval' }, emerald: { cut: 'emerald' } } },
              ],
              size: { fieldId: 303, scale: { '0.05': 1, '0.10': 1.2 } },
            },
          },
        ],
      },
    },
  },

  flow: {
    // V5 (Jewelry) unless the link names another version
    defaultPlacement: 'jewelry',
    // V5's tabs: Personalize first — the initials decide how many stones fit
    // between them — then Customize, the stone, and Add to bag
    jewelrySteps: [
      { label: 'Personalize', fieldIds: [307, 305, 306] },
      { label: 'Customize',   fieldIds: [302, 310, 303, 311] },
    ],
    // Only the finish stays on the page above the CTA in V1 / V4: the stone goes
    // behind the row with its shape and size, after the initials
    entryFieldIds: [301],
    entryCta: 'Personalize',
    // The Personalize card's line: initials and stones, not a script name
    personalizeRow: { title: 'Personalize Yours', description: 'Choose your initials and stones' },
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'addToBag',
    nextCta: 'Continue to {next}',
    stickyBar: true,
  },
}
