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
import { IconChevronDown } from '../icons/Icons'
import styles from './ThemeSwitcher.module.css'

export function ThemeSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const currentBrand = getBrandFromPathname(pathname)
  const current = getBrandMeta(currentBrand)

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
        <IconChevronDown
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
