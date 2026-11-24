'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import QRCode from 'qrcode'
import { Modal } from '../Modal'
import styles from './ViewInRoom.module.css'

interface ViewInRoomQrProps {
  open: boolean
  onClose: () => void
  /** The phone link: this product page, the shopper's choices, and View in Room. */
  url: string
  closeIcon: ReactNode
}

/**
 * View in Room on a computer: there's no AR on desktop, so a QR code opens this
 * product on the shopper's phone with their song, size and frame filled in.
 */
export function ViewInRoomQr({ open, onClose, url, closeIcon }: ViewInRoomQrProps) {
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 400, errorCorrectionLevel: 'M' })
      .then((d) => { if (!cancelled) setCode(d) })
      .catch(() => { if (!cancelled) setCode(null) })
    return () => { cancelled = true }
  }, [open, url])

  return (
    <Modal open={open} onClose={onClose} labelledBy="vir-qr-title" closeIcon={closeIcon} centered>
      <div className={styles.qr}>
        {code ? <img className={styles.qrCode} src={code} alt="QR code that opens View in Room on your phone" /> : <span className={styles.qrCode} aria-hidden="true" />}
        <div>
          <h2 id="vir-qr-title" className={styles.qrTitle}>View in Room</h2>
          <p className={styles.qrText}>See your canvas on your own wall, at its real size.</p>
          <ol className={styles.qrSteps}>
            <li>Scan the code with your phone camera</li>
            <li>Point your phone at the wall</li>
            <li>Mark where the wall meets the floor</li>
          </ol>
        </div>
      </div>
    </Modal>
  )
}
