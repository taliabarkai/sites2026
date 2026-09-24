'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { useCart } from './CartContext'
import { getBrandFromPathname } from '../_config/brands'
import { getDemoCartItems, isDemoCart } from '../_config/demoCart'
import { readCartSize } from '../_config/demoParams'

/**
 * Keeps the demo bag pointed at the brand being viewed.
 *
 * The cart is one shared, persisted store, so without this a bag filled on one
 * brand follows you to the next and every page renders the previous brand's
 * products. Two things decide the bag:
 *
 *  · `?items=` names a size outright, so a shared link lands on the bag it
 *    describes.
 *  · Failing that, a bag that is plainly a demo bag keeps its size and is
 *    re-pointed at this brand's equivalent products.
 *
 * A cart the shopper actually built has ids of its own and is left alone.
 *
 * Lifted out of the checkout's cart-size control so the cart page can use the
 * same rule rather than a second copy of it.
 */
export function useDemoCartSync() {
  const { items, replaceItems } = useCart()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const brand   = getBrandFromPathname(pathname)
  const urlSize = readCartSize(searchParams)

  useEffect(() => {
    const demoItems = getDemoCartItems(brand)
    const size = urlSize ?? (isDemoCart(items) ? items.length : null)
    if (size === null) return

    const want = demoItems.slice(0, size)
    const same = items.length === want.length && want.every((w, i) => items[i]?.id === w.id)
    if (!same) replaceItems(want)
    // demoItems is rebuilt each render from static config; keying the effect on
    // it would re-run this on every render and fight the shopper's own edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSize, items, replaceItems, brand])
}
