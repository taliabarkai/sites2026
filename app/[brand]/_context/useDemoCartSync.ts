'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { useCart } from './CartContext'
import { getBrandFromPathname } from '../_config/brands'
import { getDemoCartItems, isDemoCart } from '../_config/demoCart'
import { readCartSize } from '../_config/demoParams'
import { getGiftOptions } from '../_config/giftOptions'
import { getBrandFeatures } from '../_config/flow'

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
    if (!same) {
      replaceItems(want)
      return
    }

    /*
     * Right products, but not necessarily the right add-ons.
     *
     * Four of the five brands share the demo bag's item ids, so matching ids
     * are no proof the bag was filled on this brand — and what was bought onto
     * a line does not travel. Packaging belongs to a brand's own catalogue, so
     * another brand's option cannot be resolved here: the tray shows the line
     * as unwrapped while the summary still charges for it. The protection plan
     * is the same story on a brand that sells none.
     *
     * Checking the add-ons rather than tracking the navigation is what makes
     * this hold on a cold load of the URL, not only on a switch made in the
     * theme control.
     */
    const catalogue    = new Set(getGiftOptions(brand).map(o => o.id))
    const sellsWarranty = getBrandFeatures(brand).warranty

    const cleaned = items.map(item => {
      const optionId = item.giftPackaging?.optionId
      // An item that brings its own options — LAL's per-product notes — carries
      // them on the line, so they resolve without the brand catalogue.
      const keepsGift = !item.giftPackaging
        || (optionId !== undefined
            && (catalogue.has(optionId) || !!item.giftOptions?.some(o => o.id === optionId)))
      const keepsWarranty = sellsWarranty || !item.warranty
      if (keepsGift && keepsWarranty) return item
      return {
        ...item,
        giftPackaging: keepsGift ? item.giftPackaging : undefined,
        warranty:      keepsWarranty ? item.warranty : false,
      }
    })

    if (cleaned.some((c, i) => c !== items[i])) replaceItems(cleaned)
    // demoItems is rebuilt each render from static config; keying the effect on
    // it would re-run this on every render and fight the shopper's own edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSize, items, replaceItems, brand])
}
