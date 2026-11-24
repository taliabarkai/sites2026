import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tenengroup Sites 2026',
  description: 'AI Design System - OAL, TGR, LAL, IB, MNN',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* A page shown in a phone frame on /[brand]/flows or /final-flows hides Next's dev
            tools button (local dev only) — it would float over every frame */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(window.top!==window.self&&/\\/(final-)?flows\\/?$/.test(window.top.location.pathname)){var s=document.createElement('style');s.textContent='nextjs-portal{display:none!important}';document.head.appendChild(s)}}catch(e){}",
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
