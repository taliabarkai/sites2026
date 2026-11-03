'use client'

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'

import type { IconProps } from '@/src/components/icons/Icon'
import type { CartItem, SelectedOption } from '../../../_context/CartContext'
import { Button } from '../../Button'
import { Modal } from '../../Modal'
import { QuickAddPanel, type QuickAddProduct } from '../../QuickAddPanel'
import type { OutdatedItem, OutdatedResolution } from './types'
import styles from './OutdatedItems.module.css'

export interface OutdatedItemsIcons {
  WarningIcon:   React.ComponentType<IconProps>
  CheckmarkIcon: React.ComponentType<IconProps>
  XIcon:         React.ComponentType<IconProps>
}

export interface OutdatedItemsModalProps {
  open:        boolean
  entries:     OutdatedItem[]
  /** The bag as the shopper left it — image, name and price before any fix. */
  cartItems:   CartItem[]
  resolutions: Record<string, OutdatedResolution>
  onFix:       (itemId: string, price: number, selectedOptions: SelectedOption[], change: SelectedOption) => void
  onRemove:    (itemId: string) => void
  /**
   * Called on its own once the last line is fixed or removed (with something
   * left in the bag): the host closes the popup and takes the shopper to pay.
   */
  onContinue:  () => void
  /** The X, Escape or the scrim: the popup closes and the lines wait in the order summary. */
  onDismiss:   () => void
  /** Where "Continue shopping" goes once every line has been removed. */
  shopHref:    string
  /**
   * Preview-only: the demo header is lifted above the scrim so its toggles
   * stay usable, and a tall popup would otherwise run up under it.
   */
  clearHeader?: boolean
  /** Told when the item editor opens or closes — the popup steps aside meanwhile. */
  onEditingChange?: (editing: boolean) => void
  icons:       OutdatedItemsIcons
}

/** Lets the order summary's "Update" open the item editor for one line. */
export interface OutdatedItemsModalHandle {
  edit: (itemId: string) => void
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

/*
 * Copy is generic on purpose: the same for every product and every kind of
 * change, so it translates once and doesn't depend on the server describing
 * what changed.
 */

/**
 * The editor hands back each choice by its value id ("box-18"); the bag shows
 * the label ("18" Box Chain"). Resolved against the product's own options.
 */
function toDisplayOptions(product: QuickAddProduct, options: SelectedOption[]): SelectedOption[] {
  return options.map(({ label, value }) => {
    const option = product.options.find(o => o.name === label)
    const match  = option?.values?.find(v => v.value === value)
    return { label, value: match?.label ?? value }
  })
}

/**
 * Popup for bag lines that no longer match their product (an option removed,
 * a required option added, the product gone). Payment stays blocked until
 * every line is fixed or removed.
 *
 * Built to read as help rather than an interruption: it keeps everything
 * else the shopper chose and asks only for the option that changed. Fixing opens the item
 * editor — the same Quick Add panel the cart drawer edits with, in its
 * "Edit Item" mode — with the line's choices filled in and only the changed
 * option left to pick. Saving brings the shopper straight back here.
 *
 * It can be dismissed: the lines then wait in the order summary, each with
 * its own Update, and any attempt to pay brings the popup back.
 */
export const OutdatedItemsModal = forwardRef<OutdatedItemsModalHandle, OutdatedItemsModalProps>(function OutdatedItemsModal({
  open, entries, cartItems, resolutions, onFix, onRemove, onContinue, onDismiss,
  shopHref, icons, clearHeader = false, onEditingChange,
}, ref) {
  const { WarningIcon, CheckmarkIcon, XIcon } = icons
  const titleId = useId()

  /** The line open in the item editor. The popup steps aside while it is. */
  const [editingId, setEditingId] = useState<string | undefined>()
  /** Kept after the editor closes, so its slide-out still has a product to show. */
  const [editorEntry, setEditorEntry] = useState<OutdatedItem | undefined>()
  /** How many items the current run of the button walks — the "of 2" in "1 of 2 items". */
  const [runTotal, setRunTotal] = useState(0)
  /** Opened from the order summary rather than the popup: one line, and back to the page after. */
  const [inline, setInline] = useState(false)

  const lines = entries
    .map(entry => ({ entry, item: cartItems.find(i => i.id === entry.itemId) }))
    .filter((l): l is { entry: OutdatedItem; item: CartItem } => l.item !== undefined)

  const pending    = lines.filter(l => !resolutions[l.entry.itemId])
  const removedAll = cartItems.every(i => resolutions[i.id]?.status === 'removed')
  const canEdit    = (entry: OutdatedItem) => entry.issue.kind !== 'unavailable' && !!entry.editor

  /**
   * Every line the editor can fix, in bag order. One primary button walks
   * them: it opens the first, and each Update moves on to the next.
   */
  const fixables = pending.filter(l => canEdit(l.entry)).map(l => l.entry)
  /** Set by a save that has another line to go to, so the editor's close moves on instead. */
  const nextRef = useRef<OutdatedItem | undefined>(undefined)

  useEffect(() => {
    onEditingChange?.(editingId !== undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId])

  const startEditing = (entry: OutdatedItem) => {
    setEditorEntry(entry)
    setEditingId(entry.itemId)
  }

  useImperativeHandle(ref, () => ({
    edit: itemId => {
      const entry = fixables.find(e => e.itemId === itemId)
      if (!entry) return
      setInline(true)
      setRunTotal(1)
      startEditing(entry)
    },
  }))

  /** The editor closing: on to the next line after an Update, else back to the popup (Cancel, X). */
  const stopEditing = () => {
    const next = nextRef.current
    nextRef.current = undefined
    if (next) startEditing(next)
    else { setEditingId(undefined); setInline(false) }
  }

  const saveEdit = (updated: CartItem) => {
    const entry = editorEntry
    if (!entry?.editor || entry.issue.kind === 'unavailable') return
    const option   = entry.issue.option
    const selected = toDisplayOptions(entry.editor.product, updated.selectedOptions ?? [])
    const change   = selected.find(o => o.label === option) ?? { label: option, value: '' }
    onFix(entry.itemId, updated.price, selected, change)
    // From the order summary, just this line; from the popup, on to the next.
    nextRef.current = inline ? undefined : fixables.find(e => e.itemId !== entry.itemId)
  }

  const left = pending.length
  // One wording for any number of lines, so it never needs a count.
  const title    = removedAll ? 'Your bag is empty' : 'Quick update needed'
  const subtitle = removedAll
    ? 'Every item was removed from your bag.'
    : 'Something in your bag has changed since you added it. Please update it to continue.'

  // Nothing left to do: no "all set" step — straight back to paying. An empty
  // bag stays, since there is nothing to pay for.
  const settled = open && lines.length > 0 && left === 0 && !removedAll
  useEffect(() => {
    if (settled) onContinue()
    // Once, as the popup settles — the host's handler is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled])

  return (
    <>
      <Modal
        // Hidden while the editor is up, and never shown settled — it closes itself.
        open={open && editingId === undefined && !settled}
        onClose={onDismiss}
        centered
        labelledBy={titleId}
        closeIcon={<XIcon size={24} />}
        className={`${styles.dialog}${clearHeader ? ` ${styles.dialogClearHeader}` : ''}`}
      >
        {/* Icon beside the title, as in the checkout conflict alert. */}
        <header className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">
            <WarningIcon />
          </span>
          <div className={styles.headerText}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </header>

        <ul className={styles.list}>
          {lines.map(({ entry, item }) => {
            const resolution = resolutions[entry.itemId]

            // A removed line simply leaves the list.
            if (resolution?.status === 'removed') return null

            const fixed    = resolution?.status === 'fixed' ? resolution : undefined
            const price    = fixed ? fixed.price : item.price

            // The cart's out-of-stock line: the message above the product,
            // then image, name, its one action, and the price on the right.
            return (
              <li key={entry.itemId} className={styles.line}>
                {/* "Needs an update" is the title's own message, so a line only
                    says something when it differs: unavailable, or done. */}
                {fixed ? (
                  <p className={`${styles.notice} ${styles.noticeFixed}`}>
                    <span className={styles.noticeIcon} aria-hidden="true"><CheckmarkIcon size={24} /></span>
                    Item Updated
                  </p>
                ) : entry.issue.kind === 'unavailable' && (
                  <p className={styles.notice}>
                    <span className={styles.noticeIcon} aria-hidden="true"><WarningIcon size={24} /></span>
                    Item Unavailable
                  </p>
                )}

                <div className={styles.row}>
                  <img src={item.image} alt="" className={styles.image} />
                  <div className={styles.info}>
                    <p className={styles.name}>{item.name}</p>
                    {/* Fixing runs from the one button below; a line the editor
                        can't fix keeps its only way forward here. */}
                    {!fixed && !canEdit(entry) && (
                      <div className={styles.links}>
                        <button type="button" className={styles.link} onClick={() => onRemove(entry.itemId)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={styles.price}>{formatPrice(price)}</span>
                </div>
              </li>
            )
          })}
        </ul>

        {/* The one Update button while anything can be fixed, or the way out
            of an emptied bag. */}
        {(fixables.length > 0 || removedAll) && (
          <footer className={styles.footer}>
            {fixables.length > 0 ? (
              <Button
                variant="primary"
                className={styles.footerButton}
                onClick={() => { setRunTotal(fixables.length); startEditing(fixables[0]) }}
              >
                {fixables.length === 1 ? 'Update item' : 'Update items'}
              </Button>
            ) : (
              <Button variant="primary" href={shopHref} className={styles.footerButton}>Continue shopping</Button>
            )}
          </footer>
        )}
      </Modal>

      {/* The item editor — the cart drawer's Edit Item panel. Always mounted so
          it slides. From the popup, Update moves on to the next line, or closes
          after the last, and Cancel and X return to the popup. From the order
          summary it edits that one line and closes back to the page. */}
      <QuickAddPanel
        mode="edit"
        isOpen={editingId !== undefined && (open || inline)}
        onClose={stopEditing}
        product={editorEntry?.editor?.product ?? null}
        initialValues={editorEntry?.editor?.values}
        formKey={editorEntry?.itemId}
        attention={editorEntry && editorEntry.issue.kind !== 'unavailable'
          ? {
              option: editorEntry.issue.option,
              // Items already fixed this run, plus this one.
              progress: inline ? undefined : { current: runTotal - fixables.length + 1, total: runTotal },
            }
          : undefined}
        onAdd={saveEdit}
      />
    </>
  )
})
