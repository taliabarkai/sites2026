import { DEFAULT_FOOTER_COLUMNS, type FooterColumn } from '../../_config/siteContent'
import { EmailSubscription } from './EmailSubscription'
import { FooterNav } from './FooterNav'
import styles from './Footer.module.css'

export interface FooterProps {
  columns?: FooterColumn[]
}

export function Footer({ columns = DEFAULT_FOOTER_COLUMNS }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.upper}>
        <div className={styles.nav}>
          <FooterNav columns={columns} />
        </div>
        <div className={styles.newsletter}>
          <EmailSubscription />
        </div>
      </div>

      <div className={styles.lower}>
        <p className={styles.copyright}>
          © {year} All rights reserved.
        </p>
      </div>
    </footer>
  )
}
