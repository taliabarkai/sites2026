import type { BrandKey } from './brands'

/**
 * Loyalty programme copy for the order confirmation page. Brands differ in more
 * than wording — the perks themselves and their icons change — and three brands
 * have no programme at all, so the whole section is per-brand.
 */

export type LoyaltyPerkIcon =
  | 'deliveryBox' | 'gift' | 'key'
  /* TGR-only artwork */
  | 'trackOrder' | 'freeGifts' | 'earnPoints'

export interface LoyaltyPerk {
  icon: LoyaltyPerkIcon
  label: string
}

export interface LoyaltyProgram {
  title: string
  cta: string
  /** Copy either side of the balance, which renders as "<amount> <unit>". */
  unlockBefore: string
  unlockUnit: string
  unlockAfter: string
  /** TGR sets the balance apart in bold; OAL runs it inline with the sentence. */
  emphasizeBalance: boolean
  perks: LoyaltyPerk[]
}

/** Oak and Luna — keys. */
const KEY_CLUB: LoyaltyProgram = {
  title: 'Join the Key Club',
  cta: 'Create an account',
  unlockBefore: '+ Unlock your',
  unlockUnit: 'keys',
  unlockAfter: 'from this order and use them on your next piece!',
  emphasizeBalance: false,
  perks: [
    { icon: 'deliveryBox', label: 'Easier order tracking' },
    { icon: 'gift',        label: 'Free gifts and perks' },
    { icon: 'key',         label: 'Earn 100 keys when you join' },
  ],
}

/** Theo Grace — points, and its own set of perks. */
const TG_CIRCLE: LoyaltyProgram = {
  title: 'Join the TG Circle',
  cta: 'Create an account',
  unlockBefore: '+ Unlock your',
  unlockUnit: 'points',
  unlockAfter: 'from this order when you join and use them on your next piece!',
  emphasizeBalance: true,
  perks: [
    { icon: 'trackOrder', label: 'Easier order tracking' },
    { icon: 'freeGifts',  label: 'Free Gifts & Extra Perks' },
    { icon: 'earnPoints', label: 'Earn 100 loyalty points' },
  ],
}

/** `null` means the brand runs no programme, so the section is left out. */
export const BRAND_LOYALTY: Record<BrandKey, LoyaltyProgram | null> = {
  oal: KEY_CLUB,
  tgr: TG_CIRCLE,
  lal: null,
  ib:  null,
  mnn: null,
}
