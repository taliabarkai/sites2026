import styles from './RevisionsNotice.module.css'

interface RevisionsNoticeProps {
  /** Brand-scoped glyph, already rendered (e.g. <RevisionsIcon size={24} />). */
  icon?: React.ReactNode
  title?: string
  children?: React.ReactNode
}

/**
 * Shared "Unlimited Revisions Included" info card used across canvas PDPs
 * (Watercolor Dream, Pop Your Memories, …). Themed via semantic CSS variables.
 */
export function RevisionsNotice({
  icon,
  title = 'Unlimited Revisions Included',
  children = "Receive your personalized preview by email within 48 hours and enjoy unlimited revisions until it's just right.",
}: RevisionsNoticeProps) {
  return (
    <div className={styles.card}>
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{children}</p>
      </div>
    </div>
  )
}
