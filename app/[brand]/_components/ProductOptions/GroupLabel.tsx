import type { ChoiceGroup } from './types'
import styles from './ProductOptions.module.css'

/**
 * The group's visible label. Image-only swatches have no text of their own,
 * so the selected value is named here: "Birthstone — January - Garnet".
 */
export function GroupLabel({ id, group, valueLabel }: { id: string; group: ChoiceGroup; valueLabel?: string }) {
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
