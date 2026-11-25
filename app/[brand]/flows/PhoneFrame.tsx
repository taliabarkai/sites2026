import Link from 'next/link'
import styles from './Flows.module.css'

/**
 * A live, phone-sized view of one page — scaled down, still scrollable and
 * tappable. `metaFirst`: its label, title, caption and link above the phone
 * instead of below it.
 */
export function PhoneFrame({ href, title, caption, label, metaFirst = false }: { href: string; title: string; caption?: string; label: string; metaFirst?: boolean }) {
  const meta = (
    <div className={styles.meta}>
      <span className={styles.badge}>{label}</span>
      <p className={styles.itemTitle}>{title}</p>
      {caption && <p className={styles.caption}>{caption}</p>}
      <Link href={href} className={styles.open}>Open full page</Link>
    </div>
  )
  return (
    <li className={styles.item}>
      {metaFirst && meta}
      <div className={styles.frame}>
        <iframe src={href} title={`${label}: ${title} (mobile view)`} loading="lazy" className={styles.iframe} />
      </div>
      {!metaFirst && meta}
    </li>
  )
}
