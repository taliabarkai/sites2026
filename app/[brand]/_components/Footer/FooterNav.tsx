'use client'

import { useState } from 'react'
import { DEFAULT_FOOTER_COLUMNS, type FooterColumn } from '../../_config/siteContent'
import { IconChevronDown } from '../icons/Icons'
import styles from './FooterNav.module.css'

export interface FooterNavProps {
  columns?: FooterColumn[]
}

export function FooterNav({ columns = DEFAULT_FOOTER_COLUMNS }: FooterNavProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <nav className={styles.nav} aria-label="Footer">
      <div className={styles.desktop}>
        {columns.map((column) => (
          <div key={column.title} className={styles.column}>
            <h3 className={styles.columnTitle}>{column.title}</h3>
            <ul className={styles.linkList}>
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.link}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.mobile}>
        {columns.map((column, index) => {
          const isOpen = openIndex === index
          const panelId = `footer-panel-${index}`

          return (
            <div key={column.title} className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionTrigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{column.title}</span>
                <IconChevronDown
                  className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                />
              </button>
              <div
                id={panelId}
                className={`${styles.accordionPanel} ${isOpen ? styles.accordionPanelOpen : ''}`}
                hidden={!isOpen}
              >
                <ul className={styles.linkList}>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={styles.link}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
