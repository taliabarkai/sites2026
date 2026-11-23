import type { ChoiceGroup } from './types'
import styles from './ProductOptions.module.css'

/**
 * The group's visible label. Image-only swatches have no text of their own,
 * so the selected value is named here: "Birthstone — January - Garnet" — or,
 * with `valueOnlyLabel`, only the value: "18K Gold Vermeil".
 */
export function GroupLabel({ id, group, valueLabel }: { id: string; group: ChoiceGroup; valueLabel?: string }) {
  // Just the picked value (OAL's finish): the group's name is read, not shown
  if (group.valueOnlyLabel && group.tile === 'image-only' && valueLabel) {
    return (
      <p id={id} className={styles.groupLabel}>
        <span className={styles.visuallyHidden}>{group.label}: </span>
        {valueLabel}
      </p>
    )
  }
  return (
    <p id={id} className={styles.groupLabel}>
      {group.label}
      {group.tile === 'image-only' && valueLabel && (
        <>
          {' — '}
          <span className={styles.groupValue}>{valueLabel}</span>
        </>
      )}
    </p>
  )
}
