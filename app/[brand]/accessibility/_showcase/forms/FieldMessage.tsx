'use client'

import { useBrandIcons } from '../useBrandIcons'
import styles from './forms.module.css'

/** Error or success text under a field: an icon, a hidden prefix, the words. */
export function FieldMessage({ id, tone, children }: { id: string; tone: 'error' | 'success'; children: string }) {
  const { WarningIcon, CheckmarkIcon } = useBrandIcons()
  const Icon = tone === 'error' ? WarningIcon : CheckmarkIcon

  return (
    <p id={id} className={`${styles.message} ${tone === 'error' ? styles.error : styles.success}`}>
      <span className={styles.messageIconWrap} aria-hidden="true">
        <Icon className={styles.messageIcon} />
      </span>
      <span>
        <span className={styles.visuallyHidden}>{tone === 'error' ? 'Error: ' : 'Done: '}</span>
        {children}
      </span>
    </p>
  )
}
