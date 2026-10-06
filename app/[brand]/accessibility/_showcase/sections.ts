// The page's table of contents. Each section renders as an <h2>; its
// components render as cards with an <h3>. `planned` lists the cards still to
// be built, so the structure can be reviewed before every demo exists.

export interface ShowcaseSection {
  id: string
  title: string
  intro: string
  planned: string[]
}

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    intro:
      'The tokens every component below is built on: contrast, the focus ring, target size and text that reflows.',
    planned: [],
  },
  {
    id: 'form-fields',
    title: 'Form fields',
    intro:
      'Persistent labels, errors that say what went wrong in text, and a focus ring that is more than a border-color change.',
    planned: ['Quantity stepper (waiting on a minus icon)'],
  },
  {
    id: 'search',
    title: 'Search',
    intro:
      'The header search field: an icon at each end, so the focus ring has to cover the whole field, not just the text box.',
    planned: [],
  },
  {
    id: 'buttons-links',
    title: 'Buttons and links',
    intro: 'Every button has a name, a 24×24px minimum target and a visible focus ring on any surface.',
    planned: [
      'Destructive button (needs a design decision: there is no destructive style today)',
      'Wishlist toggle (waiting on a heart icon)',
    ],
  },
  {
    id: 'product-variants',
    title: 'Product variants',
    intro:
      'Metal, color and length pickers. Unselected options need a 3:1 border, and the selected one is shown by more than color.',
    planned: [],
  },
  {
    id: 'navigation-overlays',
    title: 'Navigation and overlays',
    intro: 'Focus moves into an overlay when it opens, stays there while it is open and returns when it closes.',
    planned: [],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    intro: 'Messages that are announced, readable and stay long enough to be read.',
    planned: ['Toasts and alerts', 'Inline validation', 'Badges and ribbons'],
  },
]
