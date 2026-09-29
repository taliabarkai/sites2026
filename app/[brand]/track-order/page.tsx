import { Suspense } from 'react'
import TrackOrderClient from './TrackOrderClient'

export const metadata = {
  title: 'Track My Order',
}

/**
 * The lookup reads `order`, `email` and `status` from the query string, so the
 * client sits behind Suspense — `useSearchParams` needs a boundary, and the
 * fallback is what a shopper sees for the frame before hydration.
 */
export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderClient />
    </Suspense>
  )
}
