import type { ProductItem } from './index'
import type { QuickAddOption } from '../../app/[brand]/_components/QuickAddPanel'

// ─── Nested items Drawer demo — the charms it offers ─────────────────────────
// The drawer products (product 15 on every brand, 18 on OAL) open these in
// their "Add More Charms" drawer, in this order (the demo's charm count takes
// the first N). A charm with an `option` is personalized: the drawer asks for
// that one choice — a name, an initial or a birthstone — before adding it.
// The rest add on tap.
//
// `href` only has to be unique — nested items are keyed by it, and the form's
// "View Full Details" link is hidden in the drawer.

/** The trigger's optional description line, under "Add More Charms". */
export const NESTED_DRAWER_DESCRIPTION = 'Save 20% when you buy 2 or more charms'

/** `gallery` — every shot of the charm, the card image first. */
export type NestedCharm = ProductItem & { gallery: string[]; option?: QuickAddOption }

/** Personalized Name charms — the name, typed. */
const NAME: QuickAddOption = { name: 'Name', type: 'text-input', maxLength: 10, placeholder: 'e.g. Sofia' }

/** Willow tag and disc charms — one initial, chosen. */
const INITIAL: QuickAddOption = {
  name: 'Initial',
  type: 'pills',
  values: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({ label: letter, value: letter })),
}

/** Lock & Luna Lifestones charms — the birthstone, chosen from a grid of gem pictures. */
const BIRTHSTONE: QuickAddOption = {
  name: 'Birthstone',
  type: 'grid',
  values: [
    ['january',   'Garnet'],
    ['february',  'Amethyst'],
    ['march',     'Aquamarine'],
    ['april',     'Moissanite'],
    ['may',       'Emerald'],
    ['june',      'Alexandrite'],
    ['july',      'Ruby'],
    ['august',    'Peridot'],
    ['september', 'Sapphire'],
    ['october',   'Tourmaline'],
    ['november',  'Citrine'],
    ['december',  'Topaz'],
  ].map(([month, stone]) => ({
    label: `${month[0].toUpperCase()}${month.slice(1)} - ${stone}`,
    value: month,
    image: `/images/birthstones/${month}-${stone.toLowerCase()}.png`,
  })),
}

// The OAL CDN keeps product shots in two folders; each charm names its own.
const OAL_CDN = 'https://cdn.oakandluna.com/digital-asset'

/**
 * `shots` are paths under the CDN, without `.jpg` — or a site path (`/images/…`)
 * for a shot the CDN doesn't have — the card image first.
 */
const charm = (
  id: number,
  name: string,
  shots: string[],
  priceInCents: number,
  option?: QuickAddOption,
): NestedCharm => {
  const gallery = shots.map((shot) => (shot.startsWith('/') ? shot : `${OAL_CDN}/${shot}.jpg`))
  return {
    id,
    name,
    image: gallery[0],
    href: `/charms/${shots[0].split('/').pop()}`,
    price: `$${priceInCents / 100}`,
    priceInCents,
    gallery,
    option,
  }
}

/** `folder/base-n` for each n, in order. */
const shotsOf = (folder: 'product' | 'products', base: string, ...n: number[]) => n.map((i) => `${folder}/${base}-${i}`)

export const nestedCharms: NestedCharm[] = [
  // Not found on the CDN under a guessable name — the one shot is kept in the site
  charm(109, 'The Classic 0.1ct Diamond Drop Charm - Gold Vermeil',
    ['/images/charms/classic-diamond-drop-charm-gold-vermeil.webp'], 9500),
  charm(110, 'But First Charm - Gold Plated',
    shotsOf('product', 'but-first-charm-gold', 1, 2, 3), 4500),
  charm(101, 'Lock & Luna Heart Lifestones Charm, Gold',
    shotsOf('product', 'lock-luna-heart-lifestones-charm-gold', 3, 1, 2, 4, 5, 6), 10000, BIRTHSTONE),
  charm(102, 'Lock & Luna Heart Lifestones Charm, Silver',
    shotsOf('product', 'lock-luna-heart-lifestones-charm-silver', 4, 1, 2, 3, 5, 6), 7000, BIRTHSTONE),
  charm(103, 'Personalized Name Charm, Gold Vermeil',
    shotsOf('products', 'personalized-charm-gold-vermeil', 1, 2, 3), 6500, NAME),
  charm(104, 'Personalized Name Charm, Silver',
    shotsOf('products', 'personalized-charm-silver', 1, 2, 3), 4500, NAME),
  charm(105, 'Personalized Name Charm, 10k Solid Gold',
    shotsOf('products', 'personalized-charm-14k-solid-gold', 1, 2, 3, 4), 15000, NAME),
  charm(106, 'Willow Tag Initial Charm, Silver',
    [...shotsOf('products', 'willow-tag-initial-charm-sterling-silver', 1, 2, 3, 4),
     ...shotsOf('product', 'willow-tag-initial-charm-sterling-silver', 5)], 5500, INITIAL),
  charm(107, 'Willow Disc Initial Charm, Gold',
    [...shotsOf('products', 'willow-disc-initial-charm-gold-vermeil', 1, 2, 3, 4),
     ...shotsOf('product', 'willow-disc-initial-charm-gold-vermeil', 5)], 7000, INITIAL),
  charm(108, 'Willow Disc Initial Charm, Silver Plated',
    [...shotsOf('products', 'willow-disc-initial-charm-sterling-silver', 1, 2),
     ...shotsOf('product', 'willow-disc-initial-charm-sterling-silver', 3)], 5500, INITIAL),
]
