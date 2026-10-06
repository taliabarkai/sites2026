'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useState } from 'react'
import tokens from '../proposed-tokens.module.css'
import { usePrefersReducedMotion } from '../ShowcaseTopBar'
import { useBrandIcons } from '../useBrandIcons'
import styles from './nav.module.css'

export interface Slide {
  image: string
  title: string
  href: string
}

const AUTOPLAY_MS = 5000

/**
 * The APG carousel pattern, auto-rotating:
 *   - a Pause / Play button first in the controls (2.2.2)
 *   - rotation stops while the pointer is over it or focus is inside it,
 *     and never starts with prefers-reduced-motion
 *   - Previous / Next named in words; dots are buttons "Slide 2 of 4"
 *   - slides off-screen are inert, so Tab only reaches the visible one
 *   - slide changes are announced politely, but not while it rotates on its own
 * Arrows sit over photos, so they take the two-tone ring.
 */
export function Carousel({ label, slides }: { label: string; slides: Slide[] }) {
  const id = useId()
  const reducedMotion = usePrefersReducedMotion()
  const { ArrowIcon, PauseIcon, PlayIcon } = useBrandIcons()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focusInside, setFocusInside] = useState(false)

  // Starts paused with reduced motion on; Play still works if they choose it
  useEffect(() => {
    if (reducedMotion) setPlaying(false)
  }, [reducedMotion])

  const rotating = playing && !hovered && !focusInside

  useEffect(() => {
    if (!rotating) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [rotating, slides.length])

  const go = (next: number) => setIndex((next + slides.length) % slides.length)

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={styles.carousel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocusInside(false)
      }}
    >
      <div className={styles.carouselControls}>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          className={styles.carouselControl}
        >
          {playing ? <PauseIcon className={styles.icon} /> : <PlayIcon className={styles.icon} />}
        </button>
        {reducedMotion && !playing && <span className={styles.carouselNote}>Paused because reduced motion is on.</span>}
      </div>

      <div className={styles.carouselViewport}>
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${index * 100}%)` }}
          // Off while rotating on its own, so it doesn't talk every 5 seconds
          aria-live={rotating ? 'off' : 'polite'}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.title}
              id={`${id}-slide-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              inert={i !== index}
              className={styles.slide}
            >
              <img src={slide.image} alt="" className={styles.slideImage} />
              <a href={slide.href} className={`${styles.slideLink} ${tokens.ringMedia}`}>
                Shop {slide.title}
              </a>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          aria-controls={`${id}-slide-${index}`}
          onClick={() => go(index - 1)}
          className={`${styles.carouselArrow} ${styles.carouselPrev} ${tokens.ringMedia}`}
        >
          <span className={styles.prevArrow}>
            <ArrowIcon className={styles.icon} />
          </span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          aria-controls={`${id}-slide-${index}`}
          onClick={() => go(index + 1)}
          className={`${styles.carouselArrow} ${styles.carouselNext} ${tokens.ringMedia}`}
        >
          <ArrowIcon className={styles.icon} />
        </button>
      </div>

      <div className={styles.dots}>
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Slide ${i + 1} of ${slides.length}: ${slide.title}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => go(i)}
            className={styles.dot}
          >
            <span className={styles.dotMark} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  )
}
