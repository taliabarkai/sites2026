// Mock option config for the shared options showcase product — every option
// type the product page supports, in page order. The same data serves every
// brand; each renders it in its own theme.
//
// Swatch colors below are product content (a gem, a thread color), not
// styling: they describe the item, so they're the same in every theme.

import { oalProducts } from '../../../../../data/products'
import type { AddonGroup, ChoiceGroup, OptionGroup, OptionValue, TextInputGroup } from '../../../_components/ProductOptions'

/**
 * The product that shows every option type. Its id isn't used by any
 * brand-specific customizer, and it's read from the shared jewelry catalog
 * so it exists on every brand (LAL's own catalog is canvases).
 */
export const OPTIONS_SHOWCASE_PRODUCT_ID = 22

export const optionsShowcaseProduct = oalProducts.find((p) => p.id === OPTIONS_SHOWCASE_PRODUCT_ID)!

// ─── Shared value lists ────────────────────────────────────────────────────

const productImage = (id: number) => oalProducts.find((p) => p.id === id)?.image ?? ''

/** A faceted look for gem swatches: a highlight over the stone's color. */
const gem = (hex: string) => `radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.75) 0, ${hex} 58%)`

const BIRTHSTONES: OptionValue[] = [
  { id: 'jan', label: 'January - Garnet', swatchColor: gem('#8b1a2b') },
  { id: 'feb', label: 'February - Amethyst', swatchColor: gem('#6b3fa0') },
  { id: 'mar', label: 'March - Aquamarine', swatchColor: gem('#7fd3d1') },
  { id: 'apr', label: 'April - Clear Crystal', swatchColor: gem('#d9dee2') },
  { id: 'may', label: 'May - Emerald', swatchColor: gem('#2e8b4f') },
  { id: 'jun', label: 'June - Light Amethyst', swatchColor: gem('#c9a3e8') },
  { id: 'jul', label: 'July - Ruby', swatchColor: gem('#a3123f') },
  { id: 'aug', label: 'August - Peridot', swatchColor: gem('#8cc95a') },
  { id: 'sep', label: 'September - Sapphire', swatchColor: gem('#1f3fa8') },
  { id: 'oct', label: 'October - Pink Tourmaline', swatchColor: gem('#e584b6') },
  { id: 'nov', label: 'November - Citrine', swatchColor: gem('#e6b422') },
  { id: 'dec', label: 'December - Blue Topaz', swatchColor: gem('#4aa3df') },
]

// No flower artwork exists in the project yet — catalog charms stand in.
const FLOWER_IMAGES = [6, 8, 20, 3, 21, 2, 9, 14, 18, 23, 24, 1].map(productImage)
const BIRTH_FLOWERS: OptionValue[] = [
  'January - Carnation',
  'February - Violet',
  'March - Daffodil',
  'April - Daisy',
  'May - Lily of the Valley',
  'June - Rose',
  'July - Larkspur',
  'August - Gladiolus',
  'September - Aster',
  'October - Marigold',
  'November - Chrysanthemum',
  'December - Narcissus',
].map((label, i) => ({ id: `flower-${i + 1}`, label, image: FLOWER_IMAGES[i] }))

const COLORS: OptionValue[] = [
  { id: 'pink', label: 'Pink', swatchColor: '#f2a7c3' },
  { id: 'white', label: 'White', swatchColor: '#f7f5f2' },
  { id: 'blue', label: 'Blue', swatchColor: '#2f5fbf' },
  { id: 'green', label: 'Green', swatchColor: '#3f9a5b' },
  { id: 'red', label: 'Red', swatchColor: '#c62f3a' },
  { id: 'yellow', label: 'Yellow', swatchColor: '#f2cf45' },
  { id: 'black', label: 'Black', swatchColor: '#1c1c1c' },
  { id: 'orange', label: 'Orange', swatchColor: '#ee8a32' },
  { id: 'purple', label: 'Purple', swatchColor: '#7d4cb5' },
  { id: 'grey', label: 'Grey', swatchColor: '#9a9a9a' },
  { id: 'light-blue', label: 'Light Blue', swatchColor: '#9fcdef' },
  {
    id: 'rainbow',
    label: 'Rainbow',
    swatchColor: 'conic-gradient(#e64545, #f2a33a, #f2d84a, #4cb85c, #3f7fd9, #8a4fc4, #e64545)',
  },
]

const LENGTHS: OptionValue[] = [
  { id: '14-16', label: '14"–16"' },
  { id: '16-18', label: '16"–18"' },
  { id: '18-20', label: '18"–20"', priceDelta: 500 },
  { id: '20-22', label: '20"–22"', priceDelta: 1000 },
  { id: '22-24', label: '22"–24"', priceDelta: 1500, disabled: true },
]

const CHARACTERS: OptionValue[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...Array.from({ length: 11 }, (_, i) => String(i)),
  '?',
  '+',
  '♥',
  '★',
  '☆',
  '☺',
  '†',
].map((c) => ({ id: `char-${c}`, label: c }))

const CHARMS: OptionValue[] = [
  { id: 'heart', label: 'Heart Lock', image: productImage(8) },
  { id: 'compass', label: 'Compass', image: productImage(2) },
  { id: 'tag', label: 'Willow Tag', image: productImage(3) },
  { id: 'puffy', label: 'Puffy Heart', image: productImage(20), priceDelta: 1500 },
  { id: 'disc', label: 'Willow Disc', image: productImage(21) },
  { id: 'coin', label: 'Coins & Initials', image: productImage(23), priceDelta: 2000 },
]

// ─── The groups, in page order ─────────────────────────────────────────────

const material: ChoiceGroup = {
  id: 'material',
  label: 'Select material',
  display: 'list-dropdown',
  tile: 'standard',
  showPrice: true,
  values: [
    { id: 'silver', label: '925 Sterling Silver', image: productImage(12), priceDelta: -5800 },
    { id: 'gold-plated', label: 'Gold Plated', image: productImage(22) },
    { id: 'vermeil', label: '18k Gold Vermeil', image: productImage(3), priceDelta: 2000 },
    { id: 'solid', label: '14k Solid Gold', image: productImage(24), priceDelta: 18000 },
  ],
  defaultValueId: 'silver',
  required: true,
}

const stone: ChoiceGroup = {
  id: 'stone',
  label: 'Select stone option',
  display: 'select',
  values: [
    { id: 'none', label: 'None' },
    { id: 'cz', label: 'Cubic Zirconia', priceDelta: 1500 },
    { id: 'moissanite', label: 'Moissanite', priceDelta: 4000 },
    { id: 'lab-diamond', label: 'Lab-Grown Diamond', priceDelta: 8000 },
  ],
}

const textField: TextInputGroup = {
  kind: 'text-input',
  id: 'text-field',
  label: 'Text Field',
  maxLength: 8,
  placeholder: 'e.g. Sofia',
}

const textDropdown: ChoiceGroup = {
  id: 'text-dropdown',
  label: 'Text Dropdown',
  display: 'select',
  values: ['4"', '5"', '6"', '7"', '8"'].map((label, i) => ({ id: `drop-${i + 4}`, label })),
}

const visualList: ChoiceGroup = {
  id: 'visual-list',
  label: 'Visual Dropdown - List',
  display: 'list-dropdown',
  tile: 'standard',
  values: COLORS,
}

const visualStandard: ChoiceGroup = {
  id: 'visual-standard',
  label: 'Visual Dropdown - Standard Image',
  display: 'panel-dropdown',
  tile: 'standard',
  values: BIRTH_FLOWERS,
}

const visualText: ChoiceGroup = {
  id: 'visual-text',
  label: 'Visual Dropdown - No Image',
  display: 'panel-dropdown',
  tile: 'text',
  values: CHARACTERS,
}

const visualBig: ChoiceGroup = {
  id: 'visual-big',
  label: 'Visual Dropdown - Big Image',
  display: 'panel-dropdown',
  tile: 'big',
  imageShape: 'circle',
  values: BIRTHSTONES,
}

const carouselStandard: ChoiceGroup = {
  id: 'carousel-standard',
  label: 'Carousel - Standard Image',
  display: 'carousel',
  tile: 'standard',
  values: BIRTH_FLOWERS,
}

const carouselText: ChoiceGroup = {
  id: 'carousel-text',
  label: 'Carousel - No Image',
  display: 'carousel',
  tile: 'text',
  values: LENGTHS,
}

const carouselBig: ChoiceGroup = {
  id: 'carousel-big',
  label: 'Carousel - Big Image',
  display: 'carousel',
  tile: 'big',
  imageShape: 'circle',
  values: COLORS,
}

const gridStandard: ChoiceGroup = {
  id: 'grid-standard',
  label: 'Open Grid - Standard Image',
  display: 'grid',
  tile: 'standard',
  values: BIRTHSTONES,
}

const gridText: ChoiceGroup = {
  id: 'grid-text',
  label: 'Open Grid - No Image',
  display: 'grid',
  tile: 'text',
  values: [
    { id: 'size-5', label: 'Size 5' },
    { id: 'size-6', label: 'Size 6' },
    { id: 'size-7', label: 'Size 7' },
    { id: 'size-8', label: 'Size 8' },
    { id: 'size-9', label: 'Size 9', disabled: true },
    { id: 'size-10', label: 'Size 10' },
    { id: 'size-11', label: 'Size 11' },
  ],
}

const gridBig: ChoiceGroup = {
  id: 'grid-big',
  label: 'Open Grid - Big Image',
  display: 'grid',
  tile: 'big',
  imageShape: 'square',
  values: CHARMS,
}

const drawer: ChoiceGroup = {
  id: 'drawer',
  label: 'Drawer',
  display: 'drawer',
  tile: 'big',
  imageShape: 'square',
  values: CHARMS,
}

const carouselSwatchSm: ChoiceGroup = {
  id: 'carousel-swatch-sm',
  label: 'Carousel - Standard Image Only',
  display: 'carousel',
  tile: 'image-only',
  size: 'sm',
  values: BIRTHSTONES,
}

const carouselSwatchLg: ChoiceGroup = {
  id: 'carousel-swatch-lg',
  label: 'Carousel - Big Image Only',
  display: 'carousel',
  tile: 'image-only',
  size: 'lg',
  values: BIRTHSTONES,
  defaultValueId: 'jun',
}

const warrantyPackaging: AddonGroup = {
  kind: 'addon',
  id: 'warranty-packaging',
  label: 'Add Warranty & Packaging',
  layout: 'carousel',
  items: [
    {
      id: 'warranty',
      title: 'Lifetime Warranty',
      price: 1500,
      image: productImage(19),
      details: 'Covers repairs, replacement stones and re-plating for as long as you own the piece. Register it from your order confirmation.',
    },
    {
      id: 'gift-box',
      title: 'Classic Gift Box',
      price: 400,
      image: 'https://cdn.theograce.com/digital-asset/product/gift-box-21.jpg',
      details: 'A keepsake box with a ribbon and a blank card, packed with the order.',
    },
    {
      id: 'personalized-box',
      title: 'Personalized Gift Box',
      price: 700,
      image: 'https://cdn.theograce.com/digital-asset/product/personalized-gift-boxes-7.jpg',
      details: 'Our gift box with a name or short message printed on the lid.',
    },
  ],
}

const secondItem: AddonGroup = {
  kind: 'addon',
  id: 'second-item',
  label: 'Add a second item at 50% off',
  layout: 'single',
  items: [
    {
      id: 'second-item',
      title: 'Ivy Name Paperclip Chain Bracelet — Gold Plated',
      image: productImage(15),
      percentOfItem: 0.5,
    },
  ],
}

export const OPTION_GROUPS: OptionGroup[] = [
  material,
  stone,
  textField,
  textDropdown,
  visualList,
  visualStandard,
  visualText,
  visualBig,
  carouselStandard,
  carouselText,
  carouselBig,
  gridStandard,
  gridText,
  gridBig,
  drawer,
  carouselSwatchSm,
  carouselSwatchLg,
  warrantyPackaging,
  secondItem,
]

/** The group whose text the IB Translation Advisor fills in. */
export const ENGRAVING_GROUP_ID = textField.id
