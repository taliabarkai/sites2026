// Success-screen preview version for the customer feedback page (?v=v1 | v2 | v3).
// Plain module (not 'use client') so the server pages can parse the param.
//
//   v1  Share the Love — the Trustpilot review widget from the thank-you page
//   v2  Discount — the percent-off code for the next order
//   v3  Brand image — the brand's own clickable artwork, linking to Trustpilot

export type FeedbackSuccessVersion = 'v1' | 'v2' | 'v3'

export function parseSuccessVersion(value: string | string[] | undefined): FeedbackSuccessVersion {
  return value === 'v2' || value === 'v3' ? value : 'v1'
}
