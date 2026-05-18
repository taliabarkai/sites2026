import type { FooterColumn, NavLink } from './siteContent'

export function withBrandPrefix(brand: string, href: string): string {
  if (href.startsWith('http') || href.startsWith('#')) return href
  const path = href.startsWith('/') ? href : `/${href}`
  return `/${brand}${path}`
}

export function prefixNavLinks(brand: string, links: NavLink[]): NavLink[] {
  return links.map((link) => ({
    ...link,
    href: withBrandPrefix(brand, link.href),
  }))
}

export function prefixFooterColumns(brand: string, columns: FooterColumn[]): FooterColumn[] {
  return columns.map((column) => ({
    ...column,
    links: column.links.map((link) => ({
      ...link,
      href: withBrandPrefix(brand, link.href),
    })),
  }))
}
