import '@/styles/themes/oal.css'
import '@/styles/themes/tgr.css'
import '@/styles/themes/lal.css'
import '@/styles/themes/ib.css'
import '@/styles/themes/mnn.css'

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Akatab:wght@400;600;700&family=EB+Garamond:wght@400;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Assistant:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  )
}
