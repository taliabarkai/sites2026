import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tenengroup Sites 2026',
  description: 'AI Design System - OAL, TGR, LAL, IB, MNN',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
