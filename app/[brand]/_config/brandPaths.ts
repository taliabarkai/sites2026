import type { FooterColumn, NavLink } from './siteContent'

const GLOBAL_ROUTES = ['/styleguide']

export function isGlobalHref(href: string): boolean {
  if (href.startsWith('http') || href.startsWith('#')) return true
  const path = href.startsWith('/') ? href : `/${href}`
  return GLOBAL_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

export function withBrandPrefix(brand: string, href: string): string {
  if (isGlobalHref(href)) {
    return href.startsWith('/') || href.startsWith('http') || href.startsWith('#')
      ? href
      : `/${href}`
  }
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
