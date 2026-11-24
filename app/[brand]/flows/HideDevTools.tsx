/**
 * Hides Next.js's dev tools button (the "N", local dev only) while the Flows
 * page is open — it floats over the page and every phone frame. The frames'
 * own pages are covered by the inline script in the root layout.
 */
export function HideDevTools() {
  return <style>{'nextjs-portal{display:none!important}'}</style>
}
