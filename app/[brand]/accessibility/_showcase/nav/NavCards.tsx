'use client'

import { usePathname } from 'next/navigation'
import { Button } from '../../../_components/Button'
import { BRAND_HIGHLIGHTS } from '../../../_config/highlights'
import { getBrandFromPathname } from '../../../_config/brands'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import tokens from '../proposed-tokens.module.css'
import { Carousel } from './Carousel'
import { Accordion, Tabs } from './Disclosure'
import { Drawer, Modal } from './Overlays'
import { Tooltip } from './Tooltip'
import { Breadcrumbs, Pagination } from './Wayfinding'
import {
  TodayAccordion,
  TodayBreadcrumbs,
  TodayCarousel,
  TodayDrawer,
  TodayModal,
  TodayPagination,
  TodayTabs,
  TodayTooltip,
} from './Production'
import styles from './nav.module.css'

const DETAILS = [
  {
    title: 'Materials and care',
    content: (
      <p className={styles.text}>
        18k gold vermeil: a thick layer of 18k gold over sterling silver. Take it off before swimming, and wipe
        it with the cloth in the box.
      </p>
    ),
  },
  {
    title: 'Shipping and returns',
    content: <p className={styles.text}>Free shipping on every order. Returns within 30 days, except engraved pieces.</p>,
  },
  {
    title: 'Engraving',
    content: <p className={styles.text}>Up to 12 letters, engraved by hand. We engrave exactly what you type, including capitals.</p>,
  },
]

const TABS = [
  {
    label: 'Description',
    content: (
      <p className={styles.text}>
        A dainty name necklace, cut from a single sheet of metal and polished by hand. Wear it alone or layered.
      </p>
    ),
  },
  { label: 'Size and fit', content: <p className={styles.text}>Pendant: 1.2" wide. Chain: 16", 18" or 20", with a 2" extender.</p> },
  { label: 'Reviews (128)', content: <p className={styles.text}>4.8 out of 5 stars, from 128 reviews.</p> },
]

const TRAIL = [
  { label: 'Home', href: '#breadcrumbs' },
  { label: 'Necklaces', href: '#breadcrumbs' },
  { label: 'Name necklaces', href: '#breadcrumbs' },
]

function useSlides() {
  const brand = getBrandFromPathname(usePathname())
  return BRAND_HIGHLIGHTS[brand].slice(0, 4).map((item) => ({ image: item.image, title: item.label, href: '#carousel' }))
}

function GiftNoteContent() {
  return (
    <p className={styles.text}>
      Add a printed note to the box. We&rsquo;ll include it with the packing slip, without prices.
    </p>
  )
}

// ─── Carousel ──────────────────────────────────────────────────────────────

export function CarouselCard() {
  const { isAfter } = useShowcaseView()
  const slides = useSlides()
  return (
    <ShowcaseCard
      id="carousel"
      title="Carousel"
      criteria={['2.2.2 Pause, Stop, Hide', '2.4.7 Focus Visible', '4.1.2 Name, Role, Value', '2.3.3 Animation from Interactions']}
      notes={{
        before: 'Homepage Best Sellers: 32px arrows that only appear on hover — invisible to keyboard users — and no dots or pause. Nothing on the site auto-rotates.',
        after:
          'A Pause button first; rotation stops on hover and focus and never starts with reduced motion. Arrows and dots are named, and hidden slides can’t be tabbed into.',
      }}
      dos={[
        'Put Pause / Play first, before the slides.',
        'Name the dots: "Slide 2 of 4: Necklaces".',
        'Stop rotating while the pointer or focus is inside.',
      ]}
      donts={[
        "Don't auto-rotate without a pause button.",
        "Don't let Tab reach links on slides that aren't showing.",
        "Don't animate slides when reduced motion is on.",
      ]}
    >
      {isAfter ? <Carousel label="New this season" slides={slides} /> : <TodayCarousel slides={slides} />}
    </ShowcaseCard>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────

export function ModalCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="modal"
      title="Modal dialog"
      criteria={['2.1.2 No Keyboard Trap', '2.4.3 Focus Order', '4.1.2 Name, Role, Value']}
      notes={{
        before: 'The site’s Modal component: Tab is trapped, Escape closes and focus returns, but focus isn’t moved into it when it opens.',
        after:
          'A native <dialog>: focus moves to its heading, Tab can’t leave it, Escape or Close shuts it, and focus returns to the button that opened it.',
      }}
      dos={[
        'Use <dialog> with showModal(); the rest of the page goes inert for free.',
        'Label it with its heading (aria-labelledby).',
        'Send focus back to the button that opened it.',
      ]}
      donts={["Don't let Tab reach the page behind.", "Don't leave focus at the top of the page after closing."]}
    >
      {isAfter ? (
        <Modal
          triggerLabel="Add a gift note"
          title="Gift note"
          footer={(close) => (
            <>
              <Button variant="primary" className={tokens.ringFilled} onClick={close}>
                Save note
              </Button>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            </>
          )}
        >
          <GiftNoteContent />
        </Modal>
      ) : (
        <TodayModal />
      )}
    </ShowcaseCard>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────

export function DrawerCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="drawer"
      title="Side drawer"
      criteria={['2.1.2 No Keyboard Trap', '2.4.3 Focus Order', '2.4.11 Focus Not Obscured (Minimum)']}
      notes={{
        before: 'FloatingCart: it slides in, but the closed drawer is never inert, so Tab still walks through it. The 32px Close button has outline: none, and focus isn’t returned.',
        after:
          'The FloatingCart slide-in, plus: focus moves in, Tab stays inside, Escape closes, focus returns, and the closed drawer is inert so it can’t be tabbed into.',
      }}
      dos={[
        'Make the closed panel inert, not just off-screen.',
        'Move focus to the drawer’s heading on open.',
        'Return focus to the trigger on close.',
      ]}
      donts={["Don't leave an off-screen panel in the tab order.", "Don't open a drawer without a visible Close button."]}
    >
      {isAfter ? (
        <Drawer
          triggerLabel="Open bag (2 items)"
          title="Your bag"
          footer={(close) => (
            <>
              <Button variant="primary" className={tokens.ringFilled} onClick={close}>
                Check out
              </Button>
              <Button variant="secondary" onClick={close}>
                Keep shopping
              </Button>
            </>
          )}
        >
          <p className={styles.text}>Custom name necklace, 18k gold vermeil, 18&Prime; — $130</p>
          <p className={styles.text}>Birth flower ring, sterling silver, size 6 — $85</p>
        </Drawer>
      ) : (
        <TodayDrawer />
      )}
    </ShowcaseCard>
  )
}

// ─── Accordion ─────────────────────────────────────────────────────────────

export function AccordionCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="accordion"
      title="Accordion"
      criteria={['4.1.2 Name, Role, Value', '1.3.1 Info and Relationships', '2.1.1 Keyboard']}
      notes={{
        before: 'Footer sections on mobile: buttons with aria-expanded, but not inside headings, and no focus style.',
        after: 'Each header is a button inside a heading, with aria-expanded and aria-controls. The chevron turns, and the state is also read out.',
      }}
      dos={['Use a <button> inside a heading for each header.', 'Let panels open independently unless there is a reason not to.']}
      donts={["Don't make the header a div with a click handler.", "Don't show open/closed with the icon alone to screen readers."]}
      states={[
        { label: 'Closed', content: <Accordion items={DETAILS.slice(0, 1)} /> },
        { label: 'Open', content: <Accordion items={DETAILS.slice(0, 1)} defaultOpen={[0]} /> },
        { label: 'Focus', content: <Accordion items={DETAILS.slice(0, 1)} demoFocusIndex={0} /> },
      ]}
    >
      {isAfter ? <Accordion items={DETAILS} defaultOpen={[0]} /> : <TodayAccordion items={DETAILS} />}
    </ShowcaseCard>
  )
}

// ─── Tabs ──────────────────────────────────────────────────────────────────

export function TabsCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="tabs"
      title="Tabs"
      criteria={['2.1.1 Keyboard', '4.1.2 Name, Role, Value', '1.4.1 Use of Color']}
      notes={{
        before: 'Music Memories steps: role="tab" and aria-selected only — no linked panels, no arrow keys, and selected shown by text color alone.',
        after:
          'The ARIA tabs pattern: one tab stop, Left / Right to switch, Home / End, then Tab into the panel. Selected is bold with a bar; focus is the ring.',
      }}
      dos={['Use roving tabindex: only the selected tab is in the tab order.', 'Show the selected tab with weight and a bar, not color alone.']}
      donts={["Don't make every tab a tab stop.", "Don't use an underline for both selected and focus."]}
      states={[{ label: 'Focus on an unselected tab', content: <Tabs label="Product information" items={TABS} demoFocusIndex={1} /> }]}
    >
      {isAfter ? <Tabs label="Product information" items={TABS} /> : <TodayTabs items={TABS} />}
    </ShowcaseCard>
  )
}

// ─── Breadcrumbs ───────────────────────────────────────────────────────────

export function BreadcrumbsCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="breadcrumbs"
      title="Breadcrumbs"
      criteria={['2.4.8 Location', '1.3.1 Info and Relationships', '2.4.4 Link Purpose (In Context)']}
      notes={{
        before: 'Product page: a labelled nav and list, but no aria-current, the current product isn’t listed, and the last crumb is a link.',
        after: 'A nav labelled "Breadcrumb", an ordered list, the current page as plain text with aria-current, and separators hidden from screen readers.',
      }}
      dos={['Mark the current page with aria-current="page".', 'Hide the separators from screen readers.']}
      donts={["Don't make the current page a link to itself.", "Don't type separators as text characters."]}
    >
      {isAfter ? <Breadcrumbs trail={TRAIL} current="Custom name necklace" /> : <TodayBreadcrumbs trail={TRAIL} current="Custom name necklace" />}
    </ShowcaseCard>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────

export function PaginationCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="pagination"
      title="Pagination"
      criteria={['2.4.4 Link Purpose (In Context)', '2.5.8 Target Size (Minimum)', '1.4.1 Use of Color']}
      notes={{
        before: 'There’s no pagination on the site: reviews use Load More, which adds cards without moving focus or announcing anything.',
        after:
          'A nav labelled "Pagination", 44px targets, each link named "Page 3", the current page filled and bold with aria-current, and Previous / Next in words.',
      }}
      dos={['Name each link "Page 3", not just "3".', 'Show the current page with a fill and weight.']}
      donts={["Don't leave a dead Previous link on page 1.", "Don't use arrows with no words or names."]}
      states={[
        { label: 'Page 1', content: <Pagination total={8} /> },
        { label: 'Focus', content: <Pagination total={8} defaultPage={4} demoFocusPage={5} /> },
      ]}
    >
      {isAfter ? <Pagination total={8} defaultPage={3} /> : <TodayPagination total={8} />}
    </ShowcaseCard>
  )
}

// ─── Tooltip ───────────────────────────────────────────────────────────────

const VERMEIL_TIP = 'A thick layer of 18k gold over sterling silver. It lasts longer than gold plating.'

export function TooltipCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="tooltip"
      title="Tooltip"
      criteria={['1.4.13 Content on Hover or Focus', '2.1.1 Keyboard', '4.1.2 Name, Role, Value']}
      notes={{
        before: 'Checkout phone field: an icon on a span with an aria-label. It can’t be focused, and no tip ever appears.',
        after:
          'Shows on hover and on focus, Escape hides it without moving focus, the pointer can move onto it, and it stays until you leave.',
      }}
      dos={[
        'Show it on focus as well as hover.',
        'Let Escape close it, and let the pointer move onto it.',
        'Keep it short; anything longer belongs on the page.',
      ]}
      donts={["Don't put links or buttons in a tooltip.", "Don't hide it on a timer."]}
      states={[{ label: 'Open', content: <p className={styles.text}>18k gold vermeil <Tooltip term="gold vermeil" tip={VERMEIL_TIP} demoOpen /></p> }]}
    >
      <p className={styles.text}>
        Metal: 18k gold vermeil{' '}
        {isAfter ? <Tooltip term="gold vermeil" tip={VERMEIL_TIP} /> : <TodayTooltip tip={VERMEIL_TIP} />}
      </p>
    </ShowcaseCard>
  )
}
