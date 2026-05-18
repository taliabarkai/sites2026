import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Design System — Style Guide',
  description: 'Tenengroup AI Design System token reference',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
