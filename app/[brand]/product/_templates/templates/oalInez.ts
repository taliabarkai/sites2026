import type { PdpTemplate } from '../pdpTemplate'

/**
 * OAL Inez Initial Necklace — the layered preview. The finish, the initials
 * and the stone all change the image, so this is
 * the template that proves the preview is state, not text.
 *
 * Opens on V5 (Jewelry): the finish (OAL's word for the metal) on the page; Personalize holds the stone
 * (with or without — with one, at least two initials, the stones between
 * them), how many initials and each initial (a dropdown with a letter
 * keyboard); Customize the stone's kind (a gemstone: ruby, black moissanite or
 * emerald; a diamond: its size and shape). One chain size, no heart; the
 * preview sets the chosen stone on the chain between the initials. Values and prices are placeholders
 * until pulled from the live PDP (oakandluna.com/products/inez-initial-heart-necklace-with-diamond-gold-vermeil).
 */
export const oalInez: PdpTemplate = {
  schemaVersion: 1,
  enabled: true,
  id: 'oal-inez',
  brand: 'oal',
  sku: 'OAL-INEZ-INITIAL-HEART', // TODO: real SKU
  productId: 9,
  summary: 'Initial necklace on V5: initials picked from a letter keyboard, with a gemstone or diamond between them (2+ initials) or none',

  gallery: { desktop: 'heroGridPhotoFirst', mobile: 'carousel' },

  // V5 (its default) splits these itself: Personalize holds the stone (with or
  // without), the count and the initials; Customize the stone's kind. These steps are V1–V4's, with the stone on the page.
  steps: [
    { label: 'Personalize', hint: 'Initials & stone', fieldIds: [307, 305, 308, 310, 303, 311] },
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
      // First in Personalize: a stone sits between initials, so it decides the count
      fieldId: 302, name: 'Stone', cartName: 'Stone', type: 'selection', displayType: 'grid', order: 2, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: 'with', showPriceDelta: false,
      values: [
        { id: 'with',    label: 'With stone',    priceDelta: 0 },
        { id: 'without', label: 'Without stone', priceDelta: -3000 },
      ],
    },
    {
      // How many initials: with a stone it's at least two (the stones sit between them)
      fieldId: 307, name: 'Select number of initials (1-5)', cartName: 'Initials', type: 'selection', displayType: 'visual_dropdown_list', order: 3, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '2',
      values: [
        { id: '1', label: '1 initial',  priceDelta: 0, visibleWhen: { fieldId: 302, valueIds: ['without'] } },
        { id: '2', label: '2 initials', priceDelta: 2500 },
        { id: '3', label: '3 initials', priceDelta: 5000 },
        { id: '4', label: '4 initials', priceDelta: 7500 },
        { id: '5', label: '5 initials', priceDelta: 10000 },
      ],
    },
    {
      // Each initial picked from a letter keyboard under its own dropdown
      fieldId: 305, name: 'Initial', cartName: 'Initial', type: 'text', displayType: 'text', order: 4, isRequired: true,
      textMinLength: 1, textMaxLength: 1, keyboard: true,
      pricing: 'none', affectsPreview: true,
      repeat: { countFieldId: 307, min: 1, max: 5, labelPattern: '{nth} initial' },
    },
    {
      // Customize: which kind of stone — each kind then shows its own choices
      fieldId: 308, name: 'Stone type', cartName: 'Stone Type', type: 'selection', displayType: 'grid', order: 5, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'diamond',
      visibleWhen: { fieldId: 302, valueIds: ['with'] },
      values: [
        { id: 'gemstone', label: 'Gemstone' },
        { id: 'diamond',  label: 'Diamond' },
      ],
    },
    {
      // Gem swatches, named beside the label ("Gemstone — Ruby")
      fieldId: 310, name: 'Gemstone', cartName: 'Gemstone', type: 'selection', displayType: 'visual', order: 6, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'ruby',
      visibleWhen: [{ fieldId: 302, valueIds: ['with'] }, { fieldId: 308, valueIds: ['gemstone'] }],
      values: [
        { id: 'ruby',             label: 'Ruby',             image: '/images/birthstones/july-ruby.png' },
        { id: 'black-moissanite', label: 'Black Moissanite', image: '/images/gems/black-moissanite.png' },
        { id: 'emerald',          label: 'Emerald',          image: '/images/birthstones/may-emerald.png' },
      ],
    },
    {
      fieldId: 303, name: 'Diamond size', cartName: 'Diamond Size', type: 'selection', displayType: 'grid', order: 7, isRequired: true,
      pricing: 'delta', affectsPreview: true, defaultValueId: '0.05', showPriceDelta: false,
      visibleWhen: [{ fieldId: 302, valueIds: ['with'] }, { fieldId: 308, valueIds: ['diamond'] }],
      values: [
        // Text only: the sizes as text tiles, no picture
        { id: '0.05', label: '0.05CT', priceDelta: 0 },
        { id: '0.10', label: '0.10CT', priceDelta: 4000 },
      ],
    },
    {
      // Text tiles (no pictures)
      fieldId: 311, name: 'Diamond shape', cartName: 'Diamond Shape', type: 'selection', displayType: 'grid', order: 8, isRequired: true,
      pricing: 'none', affectsPreview: true, defaultValueId: 'round',
      visibleWhen: [{ fieldId: 302, valueIds: ['with'] }, { fieldId: 308, valueIds: ['diamond'] }],
      values: [
        { id: 'emerald', label: 'Emerald' },
        { id: 'round',   label: 'Round' },
        { id: 'oval',    label: 'Oval' },
      ],
    },
    // No chain length: Inez comes in one size
  ],

  livePreview: {
    enabled: true,
    galleryPlacement: 'first',
    ribbon: 'Your Personalization',
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
            // Wide enough for five initials with a stone between each pair
            fieldId: 305, font: "'Cormorant Garamond', serif", box: { x: 0.14, y: 0.45, w: 0.72, h: 0.14 }, uppercase: true,
            // The stone on the chain between the initials: the gemstone's
            // picture, or the diamond's cut (scaled by its carat). Without a
            // stone neither field is in the preview, so none is drawn.
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
    // Material and the stone (with or without) stay on the page above the CTA in V1–V4; the steps hold the rest
    entryFieldIds: [301, 302],
    entryCta: 'Personalize',
    // The Personalize card's line: initials and stones, not a script name
    personalizeRow: { title: 'Personalize Yours', description: 'Choose your initials and stones' },
    container: { desktop: 'card', mobile: 'panel' },
    completion: 'addToBag',
    nextCta: 'Continue to {next}',
    stickyBar: true,
  },
}
