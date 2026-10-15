// Success-screen version for the customer feedback page (?v=v1 | v2 | v3 | v4).
// V3 is the default; the others are reachable only by link (no on-page picker).
// Plain module (not 'use client') so the server pages can parse the param.
//
//   v1  Share the Love — the Trustpilot review widget from the thank-you page
//   v2  Discount — the percent-off code for the next order
//   v3  Brand image — the brand's own clickable artwork, linking to Trustpilot
//   v4  Image + discount — v2 with the brand's image between the intro and the code

export type FeedbackSuccessVersion = 'v1' | 'v2' | 'v3' | 'v4'

export function parseSuccessVersion(value: string | string[] | undefined): FeedbackSuccessVersion {
  return value === 'v1' || value === 'v2' || value === 'v4' ? value : 'v3'
}
