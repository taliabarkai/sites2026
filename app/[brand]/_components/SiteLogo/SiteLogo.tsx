import Image from 'next/image'
import { getBrandLogo, LOGO_HEIGHT } from '../../_config/brandLogos'
import styles from './SiteLogo.module.css'

export type SiteLogoTone = 'default' | 'inverse'

export interface SiteLogoProps {
  brand: string
  className?: string
  priority?: boolean
  /** `inverse` renders the mark white (for transparent headers over imagery). */
  tone?: SiteLogoTone
}

export function SiteLogo({ brand, className, priority, tone = 'default' }: SiteLogoProps) {
  const logo = getBrandLogo(brand)

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={LOGO_HEIGHT}
      className={[styles.logo, tone === 'inverse' && styles.inverse, className]
        .filter(Boolean)
        .join(' ')}
      priority={priority}
      unoptimized
    />
  )
}
