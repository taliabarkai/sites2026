'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { PanelPortal } from '../PanelPortal'
import { layerZIndex, usePanelLayer } from '../PanelStack'
import type { ChoiceGroup } from './types'
import { OptionThumb } from './OptionThumb'
import { OptionTile } from './OptionTile'
import { useOptionIcons } from './useOptionIcons'
import { useRovingFocus } from './useRovingFocus'
import styles from './ProductOptions.module.css'

/**
 * `drawer` — a field-like trigger (large thumbnail, selected label, chevron)
 * that opens a panel with a 3-column grid of big tiles. A bottom sheet on
 * mobile, a right-hand drawer from 768px; always mounted, animated by
 * transform like every other panel.
 *
 * The panel stack handles Escape, the focus trap, the scroll lock and
 * handing focus back to the trigger. In the grid, arrows move focus and
 * Enter / Space / click choose — choosing closes the drawer.
 */
export function OptionDrawer({ group, value, onChange }: { group: ChoiceGroup; value: string; onChange: (id: string) => void }) {
  const id = useId()
  const labelId = `${id}-label`
  const titleId = `${id}-title`
  const { DropdownIcon, XIcon, CheckmarkIcon } = useOptionIcons()

  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)
  const depth = usePanelLayer(open, close, panelRef)
  const stackZ = layerZIndex(depth)

  const selectedIndex = Math.max(0, group.values.findIndex((v) => v.id === value))
  const selected = group.values[selectedIndex]

  const roving = useRovingFocus({
    count: group.values.length,
    initialIndex: selectedIndex,
    orientation: 'grid',
    isDisabled: (i) => Boolean(group.values[i]?.disabled),
  })

  // Opening lands on the selected tile
  const { setFocusIndex, refs } = roving
  useEffect(() => {
    if (!open) return
    setFocusIndex(selectedIndex)
    refs.current[selectedIndex]?.focus({ preventScroll: true })
  }, [open, selectedIndex, setFocusIndex, refs])

  return (
    <div className={styles.group}>
      <p id={labelId} className={styles.groupLabel}>
        {group.label}
      </p>
      <button
        type="button"
        className={`${styles.trigger} ${styles.drawerTrigger}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${id}-value`}
        onClick={() => setOpen(true)}
      >
        {selected && <OptionThumb value={selected} size="lg" />}
        <span id={`${id}-value`} className={styles.triggerValue}>
          {selected?.label}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <DropdownIcon size={24} />
        </span>
      </button>

      <PanelPortal>
        <div
          className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
          style={stackZ.backdrop}
          aria-hidden="true"
          onClick={close}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
          style={stackZ.panel}
          inert={!open}
        >
          <div className={styles.drawerHeader}>
            <h2 id={titleId} className={styles.drawerTitle}>
              {group.label}
            </h2>
            <button type="button" className={styles.drawerClose} aria-label="Close" onClick={close}>
              <XIcon size={24} />
            </button>
          </div>

          <div role="radiogroup" aria-labelledby={titleId} className={styles.drawerGrid}>
            {group.values.map((v, i) => (
              <OptionTile
                key={v.id}
                ref={roving.register(i)}
                value={v}
                tile={group.tile ?? 'big'}
                role="radio"
                selected={v.id === value}
                tabIndex={i === roving.focusIndex ? 0 : -1}
                imageShape={group.imageShape ?? 'square'}
                radioIndicator
                CheckmarkIcon={CheckmarkIcon}
                onSelect={() => {
                  onChange(v.id)
                  close()
                }}
                onKeyDown={(e) => roving.onKeyDown(e, i)}
              />
            ))}
          </div>
        </div>
      </PanelPortal>
    </div>
  )
}
