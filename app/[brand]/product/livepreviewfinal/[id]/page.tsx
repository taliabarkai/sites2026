import { redirect } from 'next/navigation'
import { resolveBrand } from '../../../_config/brands'
import { flowPath } from '../../../_config/personalizationFlows'

/** Old final live preview product links land on the same product in Custom Personalization. */
export default async function FinalLivePreviewProductRedirect({ params }: { params: Promise<{ brand: string; id: string }> }) {
  const { brand, id } = await params
  redirect(flowPath(resolveBrand(brand), 'custom', Number(id)))
}
