'use client'

// Shared filter panel for the category pages (/category, /category/v1, /category/v4).
// Extracted verbatim from CategoryPageClient so every version uses the same panel.

import { useState } from 'react'
import { Button } from '../_components/Button'
import { FilterChips } from '../_components/FilterChips'
import styles from './CategoryPage.module.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { key: 'featured',    label: 'Featured' },
  { key: 'price-asc',  label: 'Price: Low to high' },
  { key: 'price-desc', label: 'Price: High to low' },
] as const

export type SortKey = typeof SORT_OPTIONS[number]['key']

export const MATERIAL_FILTERS = [
  { key: 'stainless-steel',   label: 'Stainless Steel',   swatch: '#a8a9ad' },
  { key: 'sterling-silver',   label: 'Sterling Silver',   swatch: 'var(--sterling-silver-925)' },
  { key: 'gold-vermeil',      label: 'Gold Vermeil',      swatch: 'var(--gold-vermeil-18k)' },
  { key: 'gold-plated',       label: 'Gold Plated',       swatch: 'var(--solid-gold-14k)' },
  { key: 'yellow-gold',       label: 'Yellow Gold',       swatch: 'var(--solid-gold-14k)' },
  { key: 'rose-gold-vermeil', label: 'Rose Gold Vermeil', swatch: 'var(--rose-gold-14k)' },
  { key: 'rose-gold-plating', label: 'Rose Gold Plating', swatch: 'var(--rose-gold-plating-18k)' },
  { key: 'rose-gold',         label: 'Rose Gold',         swatch: 'var(--rose-gold-14k)' },
  { key: 'white-gold',        label: 'White Gold',        swatch: 'var(--white-gold-14k)' },
  { key: 'mixed-metals',      label: 'Mixed Metals',      swatch: 'linear-gradient(135deg, var(--gold-vermeil-18k) 50%, var(--sterling-silver-925) 50%)' },
  { key: 'lab-diamond',       label: 'Lab Diamond',       swatch: '#f0f0f0' },
  { key: 'gemstones',         label: 'Gemstones',         swatch: '#2d6a4f' },
  { key: 'pearls',            label: 'Pearls',            swatch: '#f5f0eb' },
] as const

export type MaterialKey = typeof MATERIAL_FILTERS[number]['key']

// ─── Filter Panel ─────────────────────────────────────────────────────────────

export function FilterPanel({
  isOpen,
  onClose,
  activeMaterials,
  onToggleMaterial,
  onClearAll,
  sortKey,
  onSortChange,
  itemCount,
  XIcon,
  ChevronIcon,
  CheckmarkIcon,
}: {
  isOpen: boolean
  onClose: () => void
  activeMaterials: Set<MaterialKey>
  onToggleMaterial: (key: MaterialKey) => void
  onClearAll: () => void
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
  itemCount: number
  XIcon: React.ComponentType<{ size?: number }>
  ChevronIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
}) {
  const [sortExpanded, setSortExpanded] = useState(true)
  const activeList = MATERIAL_FILTERS.filter(m => activeMaterials.has(m.key))

  return (
    <>
      <div
        className={`${styles.filterOverlay} ${isOpen ? styles.filterOverlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.filterPanel} ${isOpen ? styles.filterPanelOpen : ''}`}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
      >
        <div className={styles.filterPanelHeader}>
          <h2 className={styles.filterPanelTitle}>Filters</h2>
          <button
            type="button"
            className={styles.filterPanelClose}
            aria-label="Close filters"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Active filter chips */}
        {activeList.length > 0 && (
          <div className={styles.filterActiveChips}>
            <FilterChips
              chips={activeList.map(m => ({ value: m.key, label: m.label }))}
              onRemove={(value) => onToggleMaterial(value as MaterialKey)}
              onClearAll={onClearAll}
              XIcon={XIcon}
            />
          </div>
        )}

        <div className={styles.filterPanelBody}>
          {/* Sort By */}
          <div className={styles.filterSection}>
            <button
              type="button"
              className={styles.filterSortHeader}
              onClick={() => setSortExpanded(o => !o)}
              aria-expanded={sortExpanded}
            >
              <span className={styles.filterSectionTitle}>Sort By</span>
              <span className={styles.filterSortValue}>
                {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
                <span style={{ display: 'inline-flex', transform: sortExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform var(--transition-fast)' }}>
                  <ChevronIcon size={24} />
                </span>
              </span>
            </button>
            {sortExpanded && (
              <div className={styles.sortOptions} role="radiogroup" aria-label="Sort by">
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.key} className={styles.sortOption}>
                    <input
                      type="radio"
                      name="sort"
                      value={opt.key}
                      checked={sortKey === opt.key}
                      onChange={() => onSortChange(opt.key)}
                      className={styles.sortOptionInput}
                    />
                    <span className={styles.sortOptionLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className={styles.filterSection}>
            <p className={styles.filterSectionTitle}>Material</p>
            <div className={styles.materialList}>
              {MATERIAL_FILTERS.map((m) => {
                const active = activeMaterials.has(m.key)
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={`${styles.materialItem} ${active ? styles.materialItemActive : ''}`}
                    onClick={() => onToggleMaterial(m.key)}
                    aria-pressed={active}
                  >
                    <span
                      className={styles.materialSwatch}
                      style={{ background: m.swatch }}
                      aria-hidden="true"
                    />
                    <span className={styles.materialLabel}>{m.label}</span>
                    {active && (
                      <span className={styles.materialCheck} aria-hidden="true">
                        <CheckmarkIcon size={18} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sticky footer — View Items */}
        <div className={styles.filterPanelFooter}>
          <Button variant="primary" className={styles.filterViewItems} onClick={onClose}>
            View Items ({itemCount})
          </Button>
        </div>
      </div>
    </>
  )
}
