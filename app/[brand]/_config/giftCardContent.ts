/**
 * Gift card page content — shared by every brand.
 *
 * The card design creatives are not ready yet, so each design is described in
 * text and drawn from theme tokens. When the artwork lands, give each design an
 * `image` and the page will swap the text placeholders out.
 */

import type { BrandKey } from './brands'

export interface GiftCardDesign {
  id: string
  /** The line printed on the card. Doubles as the design's accessible name. */
  message: string
  /**
   * Which token pairing the placeholder card is drawn in:
   * `solid`   — brand primary fill, inverse text
   * `tinted`  — surface-primary fill, text colour
   * `outline` — page background, bordered
   */
  tone: 'solid' | 'tinted' | 'outline'
  /** Card mockup per brand, shown in the gallery once this design is chosen. */
  galleryImages?: Partial<Record<BrandKey, string>>
  /**
   * Flat card artwork per brand, for the picker tile. Without one the tile
   * uses a square crop of the gallery mockup; with neither, the text placeholder.
   */
  tileImages?: Partial<Record<BrandKey, string>>
}

export const GIFT_CARD_DESIGNS: GiftCardDesign[] = [
  { id: 'happy-birthday',  message: 'Happy Birthday',  tone: 'solid',
    galleryImages: { oal: '/images/gift-card/oal-happy-birthday.png' } },
  { id: 'happy-holidays',  message: 'Happy Holidays',  tone: 'tinted',
    galleryImages: { oal: '/images/gift-card/oal-happy-holidays-v2.png' } },
  { id: 'merry-christmas', message: 'Merry Christmas', tone: 'outline',
    galleryImages: { oal: '/images/gift-card/oal-merry-christmas.png' } },
  { id: 'i-love-you',      message: 'I Love You',      tone: 'solid',
    galleryImages: { oal: '/images/gift-card/oal-i-love-you.png' } },
]

/** Preset amounts, in cents. */
export const GIFT_CARD_AMOUNTS = [10000, 25000, 30000]

/** Custom amount bounds, in whole dollars. */
export const GIFT_CARD_CUSTOM_MIN = 10
export const GIFT_CARD_CUSTOM_MAX = 500

export const GIFT_CARD_MESSAGE_MAX = 250

/**
 * Gallery image per brand, used when the chosen design has no artwork of its
 * own. A brand with neither falls back to the live text-placeholder card.
 */
export const GIFT_CARD_GALLERY_IMAGES: Partial<Record<BrandKey, { src: string; alt: string }>> = {
  oal: { src: '/images/gift-card/oal-gift-card-bg.webp', alt: 'A black Oak and Luna gift card' },
}
