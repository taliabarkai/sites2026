'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import {
  BRANDS,
  buildBrandPath,
  getBrandFromPathname,
  getBrandMeta,
  type BrandKey,
} from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import styles from './ThemeSwitcher.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

interface ThemeSwitcherProps {
  brand?: BrandKey
}

export function ThemeSwitcher({ brand }: ThemeSwitcherProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const currentBrand = brand ?? getBrandFromPathname(pathname)
  const current = getBrandMeta(currentBrand)
  const { ChevronIcon } = BRAND_ICONS[currentBrand]

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = (brand: BrandKey) => {
    setOpen(false)
    if (brand === currentBrand) return
    router.push(buildBrandPath(pathname, brand))
  }

  return (
    <div className={styles.switcher} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Theme: ${current.label}. Change theme`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.triggerLabel}>{current.shortLabel}</span>
        <ChevronIcon
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          size={16}
        />
      </button>

      {open && (
        <ul id={menuId} className={styles.menu} role="listbox" aria-label="Select theme">
          {BRANDS.map((brand) => {
            const isActive = brand.key === currentBrand
            return (
              <li key={brand.key} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                  onClick={() => handleSelect(brand.key)}
                >
                  <span className={styles.optionCode}>{brand.shortLabel}</span>
                  {brand.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
