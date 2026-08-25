import { HERO_IMAGES } from '../../_config/siteContent'
import styles from './CategoryBanner.module.css'

export interface CategoryBannerProps {
  imageDesktop?: string
  imageMobile?: string
  /**
   * Empty by default — a banner that only sets the mood is decorative, and an
   * alt that repeats the page title is noise for a screen reader. Pass one when
   * the artwork carries copy the page doesn't repeat.
   */
  alt?: string
  /** Wraps the banner in a link when the artwork points somewhere. */
  href?: string
  className?: string
}

/**
 * Full-bleed banner for the top of a category page — the artwork strip that
 * sits under the highlights bar and above the category title. Runs edge to
 * edge, so it is deliberately outside the page's margins.
 */
export function CategoryBanner({
  imageDesktop = HERO_IMAGES.desktop,
  imageMobile = HERO_IMAGES.mobile,
  alt = '',
  href,
  className,
}: CategoryBannerProps) {
  const frame = (
    <div className={styles.frame}>
      <picture className={styles.picture}>
        <source media="(min-width: 768px)" srcSet={imageDesktop} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageMobile} alt={alt} className={styles.image} />
      </picture>
    </div>
  )

  const classes = [styles.banner, className].filter(Boolean).join(' ')

  return href ? (
    <a href={href} className={classes}>{frame}</a>
  ) : (
    <div className={classes}>{frame}</div>
  )
}
