/**
 * Gift packaging options offered per brand.
 *
 * Single source for checkout (step 3) and the product page's "See details"
 * panel, so the two can never drift apart.
 */

export interface BrandGiftOption {
  id:             string
  name:           string
  description:    string
  /** Full-sentence form used in the gifting drawer, e.g.
   *  "The Classic Gift Set includes a gift bag, gift box and a custom note". */
  longDescription: string
  /** Minor units (cents). */
  price:          number
  originalPrice?: number
  image:          string
}

const DEFAULT_GIFT_OPTIONS: BrandGiftOption[] = [
  {
    id:          'classic-gift-set',
    longDescription: 'The Classic Gift Set includes a gift bag, gift box and a custom note',
    name:        'Classic Gift Set',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.oakandluna.com/digital-asset/product/gift-box-25.jpg',
  },
]

const TGR_GIFT_OPTIONS: BrandGiftOption[] = [
  {
    id:          'classic-gift-box',
    longDescription: 'The Classic Gift Box includes a gift bag, gift box and a custom note',
    name:        'Classic Gift Box',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.theograce.com/digital-asset/product/gift-box-21.jpg',
  },
  {
    id:          'personalized-gift-box',
    longDescription: 'The Personalized Gift Box includes a gift bag, gift box, fabric pouch and a custom note',
    name:        'Personalized Gift Box',
    description: 'Includes: Gift bag, gift box, fabric pouch and a custom note',
    price:       700,
    image:       'https://cdn.theograce.com/digital-asset/product/personalized-gift-boxes-7.jpg',
  },
]

const IB_GIFT_OPTIONS: BrandGiftOption[] = [
  {
    id:          'classic-gift-set',
    longDescription: 'The Classic Gift Set includes a gift bag, gift box and a custom note',
    name:        'Classic Gift Set',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.israelblessing.com/digital-asset/product/gift-pack-1.jpg',
  },
]

/** MNN is the only brand offering three tiers. */
const MNN_GIFT_OPTIONS: BrandGiftOption[] = [
  {
    id:          'classic-gift-kit',
    longDescription: 'The Classic Gift Kit includes a gift bag, gift box and a custom note',
    name:        'Classic Gift Kit',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.myka.com/digital-asset/product/gift-box-23.jpg',
  },
  {
    id:          'premium-gift-box',
    longDescription: 'The Premium Gift Box includes a gift bag, premium gift box and a custom note',
    name:        'Premium Gift Box',
    description: 'Includes: Gift bag, premium gift box and a custom note',
    price:       700,
    image:       'https://cdn.myka.com/digital-asset/product/personalized-gift-boxs-different-designs-for-children-52.jpg',
  },
  {
    id:          'personalized-with-photo',
    longDescription: 'Personalized with Photo includes a gift bag, a gift box printed with your photo and a custom note',
    name:        'Personalized with Photo',
    description: 'Includes: Gift bag, a gift box printed with your photo and a custom note',
    price:       1000,
    image:       'https://cdn.myka.com/digital-asset/product/personalized-picture-gift-box-9.jpg',
  },
]

const GIFT_OPTIONS_BY_BRAND: Record<string, BrandGiftOption[]> = {
  tgr: TGR_GIFT_OPTIONS,
  ib:  IB_GIFT_OPTIONS,
  mnn: MNN_GIFT_OPTIONS,
}

export function getGiftOptions(brand: string): BrandGiftOption[] {
  return GIFT_OPTIONS_BY_BRAND[brand] ?? DEFAULT_GIFT_OPTIONS
}
