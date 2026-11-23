import { redirect } from 'next/navigation'
import { resolveBrand } from '../../_config/brands'
import { flowPath } from '../../_config/personalizationFlows'

/** The final live preview is now Custom Personalization — old links land there. */
export default async function FinalLivePreviewRedirect({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  redirect(flowPath(resolveBrand(brand), 'custom'))
}
