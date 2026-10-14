import type { OptionValue } from './types'
import styles from './ProductOptions.module.css'

/** A value's image or color, for triggers and list rows. */
export function OptionThumb({ value, shape = 'rounded', size = 'sm' }: { value: OptionValue; shape?: 'rounded' | 'circle'; size?: 'sm' | 'md' | 'lg' }) {
  const className = [styles.thumb, styles[`thumb_${size}`], shape === 'circle' && styles.thumbCircle].filter(Boolean).join(' ')
  return value.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={value.image} alt="" className={className} loading="lazy" aria-hidden="true" />
  ) : (
    <span className={className} style={{ background: value.swatchColor }} aria-hidden="true" />
  )
}
