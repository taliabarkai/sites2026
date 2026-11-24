import Link from 'next/link'
import styles from './Flows.module.css'

/** A live, phone-sized view of one page — scaled down, still scrollable and tappable. */
export function PhoneFrame({ href, title, caption, label }: { href: string; title: string; caption?: string; label: string }) {
  return (
    <li className={styles.item}>
      <div className={styles.frame}>
        <iframe src={href} title={`${label}: ${title} (mobile view)`} loading="lazy" className={styles.iframe} />
      </div>
      <div className={styles.meta}>
        <span className={styles.badge}>{label}</span>
        <p className={styles.itemTitle}>{title}</p>
        {caption && <p className={styles.caption}>{caption}</p>}
        <Link href={href} className={styles.open}>Open full page</Link>
      </div>
    </li>
  )
}
