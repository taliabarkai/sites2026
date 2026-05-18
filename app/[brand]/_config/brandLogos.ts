export const BRAND_LOGOS = {
  mnn: {
    src: 'https://cdn.myka.com/digital-asset/banners/SiteLogo.svg',
    alt: 'MYKA',
    width: 141,
  },
  oal: {
    src: 'https://cdn.oakandluna.com/digital-asset/banners/SiteLogo_OAL.svg',
    alt: 'Oak and Luna',
    width: 122,
  },
  tgr: {
    src: 'https://cdn.theograce.com/digital-asset/banners/TheoGrace_logoedit.svg',
    alt: 'Theo Grace',
    width: 132,
  },
  lal: {
    src: 'https://cdn.limeandlou.com/digital-asset/banners/SiteLogo_LAL.svg',
    alt: 'Lime and Lou',
    width: 120,
  },
  ib: {
    src: 'https://cdn.israelblessing.com/digital-asset/banners/IB_Logo.svg',
    alt: 'Israel Blessing',
    width: 160,
  },
} as const

import { resolveBrand, type BrandKey } from './brands'

export type BrandLogoKey = BrandKey

export const LOGO_HEIGHT = 32

export function getBrandLogo(brand: string) {
  return BRAND_LOGOS[resolveBrand(brand)]
}
