# Gifting Flow — UX Specification

> Master prompt for implementing the gifting checkout step. Your project already has images and product data; this spec covers the UX flow, states, layout rules, and interaction logic only.

---

## Overview

Gifting is **Step 3** of checkout, sitting between Shipping Method (Step 2) and Payment (Step 4). It lets the shopper add gift packaging to one or more items in their cart. Each item has its own set of eligible packaging options — eligibility is per-item, not global.

There are **two variants** for how the shopper configures a selected packaging option:

- **Panel variant** — clicking "Add" on a packaging option opens a **side panel** (desktop) / **bottom sheet** (mobile) where the shopper fills in the configuration fields (design, name, photo, gift note) and confirms with "Add to bag."
- **Inline variant** — clicking **+** on a packaging option **expands a configuration area directly below the selected card**, inside the gifting section itself. No panel or overlay. The shopper fills in the same fields inline and confirms with "Add to bag."

Both variants share identical data models, assignment logic, order summary behavior, and assigned/removal states. They differ only in *where* the configuration form renders.

---

## Data Model

### Packaging options

Each packaging option has:

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Display name (e.g. "Premium Gift Set") |
| `price` | number | Price added to the order |
| `desc` | string | Short description |
| `img` | url | Product image |
| `designs` | boolean | Whether the shopper picks a design (e.g. "Happy birthday") |
| `wantsName` | boolean | Whether a "Name on the box" field is shown (max 16 chars) |
| `wantsPhoto` | boolean | Whether a photo upload is required |

Every packaging option always includes a **gift note** (max 280 characters) regardless of its flags.

### Per-item eligibility

Each cart item carries an `opts` array listing which packaging option IDs it supports. The gifting section only shows options the item is eligible for. Some items may have one option, some may have several, and some may have none (show "Gift packaging not available for this piece").

### Designs

When a packaging option has `designs: true`, the shopper picks from a set of brand-scoped designs (e.g. "Happy birthday", "Made with love", "You are amazing"). Designs are purely cosmetic — they don't change the price. The first design is auto-selected when the configuration opens.

### Assignment state

When the shopper confirms a packaging choice, the item gets an **assignment** stored as:

```
{
  optionId: string,     // which packaging was chosen
  note: string,         // gift note text (may be empty)
  design: string|null,  // chosen design name, if applicable
  pname: string,        // name on the box, if applicable
  photo: boolean        // whether a photo was uploaded
}
```

---

## Section Layout

### Step 3: "Add gifting options"

The section always renders as checkout Step 3 with the heading **"3. Add gifting options"** followed by helper text:

> Gifts ship without a price tag. Your receipt is emailed to you.

Below this, the content differs based on **how many items are in the cart**.

---

## Single-Item Flow

When there is **one item** in the cart, the section skips the item-selection step entirely and leads directly with the packaging options as full-width cards stacked vertically (always a single column, never a grid).

### Packaging option card

Each card shows:
- Product image (left)
- Option name (bold), description, and price
- **"Add"** button (Panel variant) or **+** icon (Inline variant) on the right

The **entire card is clickable**, not just the button — tapping anywhere on the card triggers the action.

### What happens on click

- **Panel variant**: Opens the side panel pre-set to that packaging option for configuration.
- **Inline variant**: The card gets a bold border and the **+** flips to **−**. A configuration area expands directly below that card, visually connected (shared border, no gap). Clicking **−** or a different card's **+** collapses/moves the expansion. Clicking the same **−** collapses it entirely.

### When the item is already assigned

Replace the option cards with a single **assigned card** showing:
- Product image
- Item name
- Status line: ✓ {Option name} · {price}
- **Edit** link and **trash/remove** icon button

---

## Multi-Item Flow

When there are **two or more items** in the cart, the section first asks the shopper to pick which items to gift wrap.

### Heading

Below the helper text, show:

> **Which items would you like to gift wrap?**

### Item cards

Each unassigned item renders as a card showing:
- Product image (left)
- Item name (bold)
- **"Select"** button (Panel variant) or **+** icon (Inline variant) on the right

The **entire card is clickable**. Tapping anywhere triggers the action.

### Item with no eligible options

Show the card without a button, with grey text: "Gift packaging not available."

### Expanding an item's options (multi-option items)

When an item has **more than one** eligible packaging option, clicking the card toggles an **accordion** — an options panel drops down below the card showing the available packaging options as compact rows.

Each option row shows:
- Small product image
- Option name
- Price (below the name, not right-aligned)
- **"Add"** button (Panel variant) or **+** icon (Inline variant)

Only one item's accordion can be open at a time. Opening a different item's accordion closes the current one.

### Solo-option shortcut

When an item has exactly **one** eligible packaging option, clicking the card skips the accordion entirely and goes straight to configuration (opens the panel, or expands inline config directly from the item card).

### Assigned items in multi-item view

Same assigned card as single-item: shows the assignment status, Edit link, and trash button. Mixed states are normal — some items assigned, some not.

---

## Panel Variant — Configuration

When the shopper clicks "Add" on a packaging option, a **side panel** slides in from the right (desktop) or rises as a **bottom sheet** (mobile).

### Panel structure

From top to bottom:

1. **Header**: "Add {Option Name}" as the title, the item name as a caption below, and an × close button.
2. **Body** (scrollable):
   - Option description and price
   - Preview image (updates live when design changes)
   - Configuration fields (see "Configuration Fields" section below)
   - Gift note textarea
3. **Footer**: Cancel button (left) and **"Add to bag"** primary button (right).

### Panel behavior

- The panel opens pre-set to the chosen packaging option. The shopper cannot switch options from inside the panel — they must close it, remove the packaging, and re-add with a different option.
- A scrim/overlay covers the page behind the panel. Clicking the scrim closes the panel.
- Pressing Escape closes the panel.
- "Cancel" closes the panel without saving.
- "Add to bag" saves the assignment and closes the panel.
- "Add to bag" is **disabled** until all required fields are filled (e.g. "Name on the box" for personalized options, photo for photo options).

### Edit via panel

Clicking "Edit" on an assigned item opens the panel pre-filled with the existing assignment data (option, design, name, note, photo). The panel title still says "Add {Option Name}." Saving overwrites the assignment.

---

## Inline Variant — Configuration

When the shopper clicks **+** on a packaging option, the configuration **expands directly below the selected card** rather than opening a panel. No overlay, no separate UI surface.

### Expansion behavior

- The selected card and the configuration area below it are wrapped in a single **connected container** with a shared bold border — they read as one expanded unit, not two separate boxes.
- The card's **+** icon flips to **−** and gets an inverted (filled) style.
- Clicking **−** on the active card collapses the configuration.
- Clicking **+** on a different option card moves the expansion there (the old one collapses, the new one expands).
- Pressing Escape collapses the inline configuration.

### Inline layout — desktop (>900px)

The configuration area uses a **two-column grid**:
- **Left column**: Preview image (fills the column height).
- **Right column**: Configuration fields (design chips, name input, photo upload) and the gift note textarea.

Below the grid, separated by a thin rule: Cancel and **"Add to bag"** buttons aligned right.

### Inline layout — mobile (≤900px)

The two columns collapse to a **single column**: preview image on top, then fields, then note, then buttons. This breakpoint matches when the page itself goes single-column.

### Edit via inline

Clicking "Edit" on an assigned item in the inline variant opens the inline configuration pre-filled with the existing assignment data, expanding from the item's packaging options (the correct option highlighted with −).

---

## Configuration Fields

These fields appear in both the panel and inline variant. Which fields appear depends on the packaging option's flags.

### Choose a design (`designs: true`)

- Label: "Choose a design"
- Rendered as a row of **chip buttons** (pill-shaped toggles).
- One is always selected (first design auto-selected on open).
- Selecting a design updates the preview image live.
- Arrow keys navigate between chips.

### Name on the box (`wantsName: true`)

- Label: "Name on the box" with a "Required" badge.
- Text input, max 16 characters.
- Character counter below: "{n}/16 characters."
- "Add to bag" is **disabled** while this field is empty.

### Upload a photo (`wantsPhoto: true`)

- Label: "Upload a photo" with a "Required" badge.
- Upload button: "Add photo" when empty, "Photo added · Replace" when filled.
- "Add to bag" is **disabled** while no photo is uploaded.

### Gift note (always present)

- Label row: **"Your gift note"** on the left, "Create gift note" link on the right.
- Textarea, max 280 characters.
- Character counter: "{n}/280" at the bottom-right of the textarea.
- Placeholder: "Write your message or generate one with our AI gift note assistant."
- The note is optional — "Add to bag" is never blocked by an empty note.

---

## Assigned State

Once a packaging option is saved for an item, the item card switches to the **assigned state**.

### Assigned card layout

- Product image (left)
- Item name
- Status line with a checkmark: ✓ {Option name} · {price}
- Action buttons (right): trash icon (remove) and "Edit" text link

### Edit

Opens the configuration (panel or inline, depending on variant) pre-filled with all saved data: option, design, name, photo, and note.

### Remove

- **If the gift note is empty**: removes the assignment immediately with no confirmation.
- **If the gift note has content**: shows a **confirmation dialog** (see below) to prevent accidental loss of the written note.

---

## Remove Confirmation Dialog

A centered modal dialog with a scrim behind it.

- **Title**: "Remove gift packaging?"
- **Body**: "The gift note you wrote for {Item Name} will be deleted."
- **Buttons**: "Keep" (secondary) and "Remove" (primary/destructive).
- Clicking the scrim dismisses the dialog (keeps the packaging).
- Pressing Escape dismisses the dialog.
- Focus is trapped in the dialog while it's open.

---

## Order Summary

The order summary sidebar shows each cart item with its price. When an item has gift packaging assigned, an **"Includes"** line appears directly below it:

```
Willow Tag Initial Necklace — Gold Vermeil     $130
  Includes: Personalized Gift Set               $7
```

### Totals section

- Subtotal (merchandise only)
- Gift packaging total (with count if more than one item is wrapped, e.g. "Gift packaging (2)")
- Shipping
- Tax
- **Order total** (merchandise + gift packaging + shipping)

The summary is **report-only** — gifting is chosen in the section above, not in the summary. The summary just reflects the current state.

---

## Responsive Behavior

### Desktop (>900px)

- Page is a two-column grid: left column (checkout steps) + right column (order summary).
- Order summary is sticky (pins to viewport) as long as it fits; if it's taller than the viewport, it scrolls normally.
- Panel variant: side panel slides in from the right, ~420px wide.
- Inline variant: configuration uses a two-column grid (image left, fields right).

### Tablet / narrow (≤900px)

- Page collapses to a single column. Order summary moves below checkout steps.
- Inline variant: configuration collapses to a single stacked column (image on top, fields below).
- Panel variant: panel still slides from the right.

### Mobile (≤560px)

- Panel variant: panel becomes a **bottom sheet** that rises from the bottom of the screen, max-height 88vh, with a grab handle at the top.
- All cards, fields, and buttons are full-width.

---

## Interaction Summary Table

| Action | Panel variant | Inline variant |
|---|---|---|
| Click option card (single item) | "Add" button → opens panel | **+** icon → expands inline config from card |
| Click item card (multi-item) | "Select" button → expands accordion or opens panel (solo) | **+** icon → expands accordion or inline config (solo) |
| Click option row (multi-item expanded) | "Add" button → opens panel | **+** icon → expands inline config from option row |
| Collapse active config | Close panel (×, Cancel, scrim, Escape) | Click **−**, click different **+**, or press Escape |
| Save | "Add to bag" in panel footer | "Add to bag" in inline footer |
| Edit assigned item | "Edit" → opens panel pre-filled | "Edit" → expands inline config pre-filled |
| Remove assigned item (no note) | Immediate removal | Immediate removal |
| Remove assigned item (has note) | Confirmation dialog | Confirmation dialog |
