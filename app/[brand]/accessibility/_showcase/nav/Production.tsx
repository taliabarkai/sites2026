'use client'

/* eslint-disable @next/next/no-img-element */

/**
 * Production today, for the Before view. Each mirrors a live component's
 * markup and behavior, and names its source.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../../_components/Button'
import { Modal } from '../../../_components/Modal'
import { useBrandIcons } from '../useBrandIcons'
import type { Slide } from './Carousel'
import today from './production.module.css'

function Note({ children }: { children: ReactNode }) {
  return <p className={today.note}>{children}</p>
}

/** Source: HomePageClient Best Sellers — 32px arrows that only appear on hover; no dots, no pause. */
export function TodayCarousel({ slides }: { slides: Slide[] }) {
  const { ArrowIcon } = useBrandIcons()
  const trackRef = useRef<HTMLDivElement>(null)
  const scroll = (direction: 1 | -1) =>
    trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth, behavior: 'smooth' })

  return (
    <div className={today.stack}>
      <section aria-label="New this season" className={today.carousel}>
        <div ref={trackRef} className={today.track}>
          {slides.map((slide) => (
            <a key={slide.title} href={slide.href} className={today.slide}>
              <img src={slide.image} alt="" className={today.slideImage} />
              <span className={today.slideTitle}>{slide.title}</span>
            </a>
          ))}
        </div>
        <button aria-label="Previous products" onClick={() => scroll(-1)} className={`${today.arrow} ${today.arrowPrev}`}>
          <ArrowIcon className={today.arrowIcon} />
        </button>
        <button aria-label="Next products" onClick={() => scroll(1)} className={`${today.arrow} ${today.arrowNext}`}>
          <ArrowIcon className={today.arrowIcon} />
        </button>
      </section>
      <Note>Tab to the arrows: they stay invisible unless the pointer is over the carousel.</Note>
    </div>
  )
}

/** Source: _components/Modal — traps Tab, Escape closes, focus returns; but focus isn't moved in on open. */
export function TodayModal() {
  const id = useId()
  const { XIcon } = useBrandIcons()
  const [open, setOpen] = useState(false)
  return (
    <div className={today.stack}>
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Add a gift note
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} labelledBy={id} closeIcon={<XIcon size={20} />}>
        <div className={today.modalContent}>
          <h4 id={id} className={today.title}>
            Gift note
          </h4>
          <p className={today.text}>Add a printed note to the box. We&rsquo;ll include it with the packing slip, without prices.</p>
          <div>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save note
            </Button>
          </div>
        </div>
      </Modal>
      <Note>The site&rsquo;s Modal does the hard parts, but focus stays on the button behind the scrim when it opens.</Note>
    </div>
  )
}

/**
 * Source: FloatingCart — always in the DOM and slid off-screen, but never
 * inert: while closed its buttons are still in the tab order. Close button is
 * 32px with outline: none; focus isn't returned.
 */
export function TodayDrawer() {
  const { XIcon } = useBrandIcons()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={today.stack}>
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open bag (2 items)
        </Button>
      </div>
      <div className={`${today.overlay} ${open ? today.overlayOpen : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Shopping cart" className={`${today.drawer} ${open ? today.drawerOpen : ''}`}>
        <div className={today.drawerHeader}>
          <h4 className={today.title}>My Bag</h4>
          <button aria-label="Close cart" onClick={() => setOpen(false)} className={today.drawerClose}>
            <XIcon className={today.arrowIcon} />
          </button>
        </div>
        <div className={today.modalContent}>
          <p className={today.text}>Custom name necklace, 18k gold vermeil, 18&Prime; — $130</p>
          <div>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Check out
            </Button>
          </div>
        </div>
      </div>
      <Note>Tab past this button with the bag closed: focus disappears into the hidden drawer.</Note>
    </div>
  )
}

/** Source: FooterNav — aria-expanded buttons, not inside headings, no focus style. */
export function TodayAccordion({ items }: { items: { title: string; content: ReactNode }[] }) {
  const id = useId()
  const { ChevronIcon } = useBrandIcons()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className={today.accordion}>
      {items.map((item, index) => (
        <div key={item.title} className={today.accordionItem}>
          <button
            type="button"
            aria-expanded={open === index}
            aria-controls={`${id}-${index}`}
            onClick={() => setOpen(open === index ? null : index)}
            className={today.accordionButton}
          >
            {item.title}
            <span className={`${today.chevron} ${open === index ? today.chevronOpen : ''}`}>
              <ChevronIcon className={today.arrowIcon} />
            </span>
          </button>
          <div id={`${id}-${index}`} hidden={open !== index} className={today.accordionPanel}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Source: MusicMemoriesCustomizer — tablist / tab / aria-selected only: no panels linked, no arrow keys. */
export function TodayTabs({ items }: { items: { label: string; content: ReactNode }[] }) {
  const [selected, setSelected] = useState(0)
  return (
    <div className={today.stack}>
      <div role="tablist" className={today.tabList}>
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={index === selected}
            onClick={() => setSelected(index)}
            className={`${today.tab} ${index === selected ? today.tabActive : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div>{items[selected].content}</div>
    </div>
  )
}

/** Source: ProductDetailPage — separators as list items, the last crumb a link, the current page missing. */
export function TodayBreadcrumbs({ trail }: { trail: { label: string; href: string }[]; current: string }) {
  const { ChevronIcon } = useBrandIcons()
  return (
    <nav aria-label="Breadcrumb">
      <ol className={today.crumbs}>
        {trail.map((crumb, index) => (
          <li key={crumb.label} className={today.crumbGroup}>
            <a href={crumb.href} className={today.crumbLink}>
              {crumb.label}
            </a>
            {index < trail.length - 1 && (
              <span aria-hidden="true" className={today.crumbSep}>
                <ChevronIcon size={20} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Source: PDP reviews — no pagination; "Load More Reviews" adds cards with no focus move or announcement. */
export function TodayPagination({ total }: { total: number }) {
  const [shown, setShown] = useState(4)
  return (
    <div className={today.stack}>
      <ul className={today.reviews}>
        {Array.from({ length: shown }, (_, i) => (
          <li key={i} className={today.text}>
            Review {i + 1}: &ldquo;Beautiful, and the engraving is perfect.&rdquo;
          </li>
        ))}
      </ul>
      {shown < total * 4 && (
        <div>
          <Button variant="secondary" onClick={() => setShown((n) => n + 4)}>
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}

/** Source: CheckoutPageClientV1 — a span with an aria-label; it can't be focused and shows nothing. */
export function TodayTooltip({ tip }: { tip: string }) {
  const { TooltipIcon } = useBrandIcons()
  return (
    <span className={today.tooltipIcon} aria-label="About gold vermeil" title={tip}>
      <TooltipIcon size={16} />
    </span>
  )
}
