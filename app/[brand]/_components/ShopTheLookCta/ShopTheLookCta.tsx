'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './ShopTheLookCta.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface ShopTheLookCtaProps {
  label?: string
  /** Navigates to this page (V4). */
  href?: string
  /** Opens the Shop The Look panel (V1 / V2 / V3 touch). Ignored when `href` or `asLabel` is set. */
  onClick?: () => void
  /** Non-interactive label (V3 desktop: hover reveals the dots instead). */
  asLabel?: boolean
  className?: string
}

/**
 * The Shop The Look banner CTA — ProductCard's Quick-Add bag button widened to
 * hold a label. Renders as a link, a panel-opening button or a plain label.
 */
export function ShopTheLookCta({
  label = 'Shop The Look',
  href,
  onClick,
  asLabel = false,
  className,
}: ShopTheLookCtaProps) {
  const { ShoppingBagIcon } = BRAND_ICONS[getBrandFromPathname(usePathname())]
  const cls = [styles.cta, asLabel && styles.label, className].filter(Boolean).join(' ')
  const content = (
    <>
      <span className={styles.icon} aria-hidden="true">
        <ShoppingBagIcon size={20} />
      </span>
      <span className={styles.text}>{label}</span>
    </>
  )

  if (asLabel) return <span className={cls}>{content}</span>

  if (href) {
    return (
      <Link href={href} className={cls} onClick={(e) => e.stopPropagation()}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      aria-haspopup="dialog"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {content}
    </button>
  )
}
