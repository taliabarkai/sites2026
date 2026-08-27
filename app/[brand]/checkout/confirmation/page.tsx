import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ brand: string }>
}

/**
 * The confirmation page moved to /[brand]/thank-you, which is the URL meant for
 * sharing. This keeps links that were sent out before the move working.
 */
export default async function ConfirmationRedirect({ params }: PageProps) {
  const { brand } = await params
  redirect(`/${brand}/thank-you`)
}
