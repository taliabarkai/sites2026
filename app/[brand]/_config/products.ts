export interface Product {
  id: number
  name: string
  price: string
  priceInCents: number
  originalPrice?: string
  originalPriceInCents?: number
  defaultImage: string
  hoverImage: string
  rating: number
  reviewCount: number
  defaultSwatchKey: 'silver' | 'vermeil' | 'solid-14k' | 'rose'
}

export interface MaterialSwatch {
  key: 'silver' | 'vermeil' | 'solid-14k' | 'rose'
  label: string
  shortLabel: string
  color: string
  priceOffset: number // cents added to base price
}

export const MATERIAL_SWATCHES: MaterialSwatch[] = [
  { key: 'silver',    label: 'Sterling Silver',  shortLabel: 'Silver',        color: 'var(--sterling-silver-925)',   priceOffset: 0     },
  { key: 'vermeil',   label: 'Gold Vermeil 18k',  shortLabel: 'Gold Vermeil',  color: 'var(--gold-vermeil-18k)',      priceOffset: 1000  },
  { key: 'solid-14k', label: 'Solid Gold 14k',    shortLabel: 'Solid 14k',     color: 'var(--solid-gold-14k)',        priceOffset: 5000  },
  { key: 'rose',      label: 'Rose Gold 18k',     shortLabel: 'Rose Gold',     color: 'var(--rose-gold-plating-18k)', priceOffset: 1500  },
]

export const CHAIN_LENGTHS = ['14"', '16"', '18"', '20"', '24"']
export const DEFAULT_CHAIN_LENGTH = '18"'
export const MAX_ENGRAVE_CHARS = 15

// Default swatches used on category cards
export const DEFAULT_PRODUCT_SWATCHES = [
  'var(--sterling-silver-925)',
  'var(--gold-vermeil-18k)',
  'var(--solid-gold-14k)',
  'var(--rose-gold-plating-18k)',
]

export const PRODUCTS: Product[] = [
  { id: 1,  name: 'Lock & Luna Charm with Round Cut Moissanite — Gold', price: '$105', priceInCents: 10500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-4.jpg', rating: 4.8, reviewCount: 342, defaultSwatchKey: 'vermeil' },
  { id: 2,  name: 'Engraved Compass Necklace with Diamond — Gold Vermeil', price: '$150', priceInCents: 15000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/engraved-comprass-necklace-gold-vermeil-3.jpg', rating: 4.5, reviewCount: 128, defaultSwatchKey: 'vermeil' },
  { id: 3,  name: 'Willow Tag Initial Necklace with Diamond — Gold Vermeil', price: '$120', priceInCents: 12000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg', rating: 4.7, reviewCount: 256, defaultSwatchKey: 'vermeil' },
  { id: 4,  name: 'Herringbone Engraved Slim Chain Necklace — Gold Vermeil', price: '$95', priceInCents: 9500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-4.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-2.jpg', rating: 4.3, reviewCount: 89, defaultSwatchKey: 'vermeil' },
  { id: 5,  name: 'Singapore Chain Name Necklace — Gold Vermeil', price: '$110', priceInCents: 11000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg', rating: 4.9, reviewCount: 467, defaultSwatchKey: 'vermeil' },
  { id: 6,  name: 'Inez Initial Heart Necklace with Diamond — Gold Vermeil', price: '$130', priceInCents: 13000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-5.jpg', rating: 4.6, reviewCount: 203, defaultSwatchKey: 'vermeil' },
  { id: 7,  name: 'Initial Lock Necklace — Gold Plated', price: '$85', priceInCents: 8500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-3.jpg', rating: 4.2, reviewCount: 78, defaultSwatchKey: 'vermeil' },
  { id: 8,  name: 'Heart Charm Lock Necklace — Gold Plated', price: '$90', priceInCents: 9000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-10.jpg', rating: 4.4, reviewCount: 156, defaultSwatchKey: 'vermeil' },
  { id: 9,  name: 'Inez Initial Necklace with Diamonds — Gold Vermeil', price: '$145', priceInCents: 14500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-12.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg', rating: 4.8, reviewCount: 312, defaultSwatchKey: 'vermeil' },
  { id: 10, name: 'Pillar Bar Necklace — Gold Plated', price: '$80', priceInCents: 8000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-24.jpg', rating: 4.1, reviewCount: 67, defaultSwatchKey: 'vermeil' },
  { id: 11, name: 'Engraved Dot Bracelet — Silver', price: '$75', priceInCents: 7500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-6.jpg', rating: 4.5, reviewCount: 143, defaultSwatchKey: 'silver' },
  { id: 12, name: 'Lock & Luna Charm with Emerald Cut Moissanite — Silver', price: '$115', priceInCents: 11500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-4.jpg', rating: 4.7, reviewCount: 231, defaultSwatchKey: 'silver' },
  { id: 13, name: 'Belle Custom Name Necklace — Gold Plated', price: '$100', priceInCents: 10000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-33.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-35.jpg', rating: 4.6, reviewCount: 189, defaultSwatchKey: 'vermeil' },
  { id: 14, name: 'Singapore Chain Name Necklace with Heart Shaped Gemstone — Gold Vermeil', price: '$135', priceInCents: 13500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-13.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-15.jpg', rating: 4.8, reviewCount: 378, defaultSwatchKey: 'vermeil' },
  { id: 15, name: 'Ivy Name Paperclip Chain Bracelet — Gold Plated', price: '$88', priceInCents: 8800, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-11.jpg', rating: 4.3, reviewCount: 94, defaultSwatchKey: 'vermeil' },
  { id: 16, name: 'Multiple Name Necklace — Gold Vermeil', price: '$125', priceInCents: 12500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-3.jpg', rating: 4.5, reviewCount: 167, defaultSwatchKey: 'vermeil' },
  { id: 17, name: 'Mon Petit Name Necklace — Gold Plated', price: '$92', priceInCents: 9200, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/mon-petit-name-necklace-vermeil-gold-plated-14.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/mon-petit-name-necklace-gold-plated-1.jpg', rating: 4.2, reviewCount: 71, defaultSwatchKey: 'vermeil' },
  { id: 18, name: 'Bubble Up Initial Necklace — Gold Plated', price: '$78', priceInCents: 7800, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-4.jpg', rating: 4.4, reviewCount: 123, defaultSwatchKey: 'vermeil' },
  { id: 19, name: 'Petite Paperclip Necklace with Moissanite — Gold Plated', price: '$98', priceInCents: 9800, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/petite-paperclip-necklace-with-diamond-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/petite-paperclip-necklace-with-diamond-gold-vermeil-5.jpg', rating: 4.7, reviewCount: 245, defaultSwatchKey: 'vermeil' },
  { id: 20, name: 'Puffy Heart Pendant — Gold Plated', price: '$72', priceInCents: 7200, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-2.jpg', rating: 4.3, reviewCount: 88, defaultSwatchKey: 'vermeil' },
  { id: 21, name: 'Willow Disc Initial Necklace — Gold Vermeil', price: '$108', priceInCents: 10800, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-9.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-13.jpg', rating: 4.6, reviewCount: 198, defaultSwatchKey: 'vermeil' },
  { id: 22, name: 'Ivy Name Paperclip Chain Necklace with Stones — Gold Plated', price: '$118', priceInCents: 11800, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-3.jpg', rating: 4.8, reviewCount: 334, defaultSwatchKey: 'vermeil' },
  { id: 23, name: 'The Charmer Coins & Initials Necklace — Gold Plated', price: '$140', priceInCents: 14000, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-3.jpg', rating: 4.5, reviewCount: 152, defaultSwatchKey: 'vermeil' },
  { id: 24, name: 'My Signature Initial — Gold', price: '$95', priceInCents: 9500, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-10.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-4.jpg', rating: 4.7, reviewCount: 287, defaultSwatchKey: 'vermeil' },
  { id: 25, name: 'Initial Necklace — Gold Plated', price: '$82', priceInCents: 8200, defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-14.jpg', rating: 4.3, reviewCount: 99, defaultSwatchKey: 'vermeil' },
  { id: 26, name: 'Inez Initial Necklace — Gold Plated', price: '$79', priceInCents: 7900, defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/inez-initial-necklace-gold-plated-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-plated-1.jpg', rating: 4.5, reviewCount: 175, defaultSwatchKey: 'vermeil' },
]
