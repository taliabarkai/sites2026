/**
 * Contact Us — category → topic → form configuration.
 *
 * Shared by all 5 brands. The page renders straight from this config, so adding a
 * topic or a field is a data change only — never a JSX change.
 *
 * ⚠️ PLACEHOLDER COPY: only "Coupon doesn't work" under Payments & Coupons is taken
 * from the design reference. Every topic marked `placeholder: true` below has invented
 * labels, intro copy, and field sets so the flow works end to end — confirm against
 * the real reference before shipping.
 */

export interface ContactField {
  id: string
  label: string
  placeholder?: string
  required: boolean
  type: 'text' | 'email' | 'textarea'
}

export interface ContactTopic {
  id: string
  label: string
  intro: string
  fields: ContactField[]
  /** True while the intro/field set is invented rather than taken from the reference. */
  placeholder?: boolean
}

export interface ContactCategory {
  id: string
  label: string
  topics: ContactTopic[]
}

/** Generic field set used by every topic still awaiting a design reference. */
function placeholderFields(): ContactField[] {
  return [
    { id: 'name',    label: 'Name',         placeholder: 'First Name and Last Name', required: true,  type: 'text' },
    { id: 'email',   label: 'Email',        placeholder: 'you@example.com',          required: true,  type: 'email' },
    { id: 'order',   label: 'Order Number', placeholder: 'e.g. 1234567',             required: true,  type: 'text' },
    { id: 'details', label: 'How can we help?', placeholder: 'Tell us what happened', required: true, type: 'textarea' },
  ]
}

/** A single stub topic for a category with no reference screenshots yet. */
function placeholderTopic(id: string, label: string): ContactTopic {
  return {
    id,
    label,
    intro: 'Share a few details and our team will get back to you within 24 hours.',
    fields: placeholderFields(),
    placeholder: true,
  }
}

export const CONTACT_CATEGORIES: ContactCategory[] = [
  {
    id: 'shipping-tracking',
    label: 'Shipping & Tracking',
    // TODO: awaiting design reference — topic list and fields are placeholders.
    topics: [placeholderTopic('where-is-my-order', 'Where is my order?')],
  },
  {
    id: 'modify-order',
    label: 'Modify my order',
    // TODO: awaiting design reference — topic list and fields are placeholders.
    topics: [placeholderTopic('change-order-details', 'Change my order details')],
  },
  {
    id: 'received-order',
    label: 'Inquire about received order',
    // TODO: awaiting design reference — topic list and fields are placeholders.
    topics: [placeholderTopic('issue-with-item', 'Issue with an item I received')],
  },
  {
    id: 'new-order',
    label: 'Help with a new order',
    // TODO: awaiting design reference — topic list and fields are placeholders.
    topics: [placeholderTopic('help-choosing', 'Help placing a new order')],
  },
  {
    id: 'payments-coupons',
    label: 'Payments & Coupons',
    topics: [
      // TODO: fields not shown in the design reference — placeholder set.
      placeholderTopic('payment-issues', 'Payment Issues'),
      {
        // Confirmed against the design reference.
        id: 'coupon-not-working',
        label: "Coupon doesn't work",
        intro: 'Please describe the coupon issue with details, so we can help you fast.',
        fields: [
          { id: 'name',   label: 'Name',        placeholder: 'First Name and Last Name', required: true,  type: 'text' },
          { id: 'email',  label: 'Email',       placeholder: 'you@example.com',          required: true,  type: 'email' },
          { id: 'order',  label: 'Order Number', placeholder: 'e.g. 1234567',            required: false, type: 'text' },
          { id: 'coupon', label: "Coupon code that isn't working", placeholder: 'e.g. WELCOME15', required: true, type: 'text' },
        ],
      },
      // TODO: fields not shown in the design reference — placeholder set.
      placeholderTopic('add-coupon', 'Add a coupon to my order'),
      // TODO: fields not shown in the design reference — placeholder set.
      placeholderTopic('store-credit', 'Store Credit Issue'),
    ],
  },
  {
    id: 'something-else',
    label: 'Something Else',
    // TODO: awaiting design reference — topic list and fields are placeholders.
    topics: [placeholderTopic('general-question', 'General question')],
  },
]
