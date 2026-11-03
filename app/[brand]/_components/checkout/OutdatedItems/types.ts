import type { QuickAddFormValues, QuickAddProduct } from '../../QuickAddPanel'
import type { SelectedOption } from '../../../_context/CartContext'

/**
 * Why a bag line no longer matches its product. Shaped after what the server
 * has to tell us for the popup to say *what* changed, not just that something
 * did — see the open questions in the design brief.
 *
 * `option` is the option's name in the item editor, so the editor can open
 * with that one choice flagged.
 */
export type OutdatedIssue =
  /** A value the shopper picked was taken off the product. They pick its replacement. */
  | { kind: 'value-removed'; option: string; removedValue: string }
  /** The product gained a required option this line never had. */
  | { kind: 'option-added'; option: string }
  /** Nothing left to fix: the product, or every valid combination, is gone. */
  | { kind: 'unavailable' }

export interface OutdatedItem {
  itemId: string
  /** The choices that still stand, shown read-only so the shopper sees nothing was lost. */
  kept:   SelectedOption[]
  issue:  OutdatedIssue
  /**
   * The item editor (the Quick Add panel in edit mode) for this line: the
   * product as it is today, and the line's own choices to open it with.
   * Absent when the line can only be removed.
   */
  editor?: { product: QuickAddProduct; values: QuickAddFormValues }
}

export type OutdatedResolution =
  | { status: 'fixed'; price: number; selectedOptions: SelectedOption[]; change: SelectedOption }
  | { status: 'removed' }
