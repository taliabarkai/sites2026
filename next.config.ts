import type { NextConfig } from 'next'

// Ensure node is findable by Turbopack's child process spawner
process.env.PATH = `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH ?? ''}`

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'local.theograce.com',
    'local.theograce.co.uk',
    'local.myka.com',
    'local.oakandluna.com',
    'local.limeandlou.com',
    'local.settandco.com',
    'local.forevermy.com',
    'local.mynamenecklace.com',
    'local.tgr-dev.com',
    'local.tgr-dev.co.uk',
    'local.myka-dev.com',
    'local.oal-dev.com',
    'local.lal-dev.com',
    'local.fem-dev.com',
    'local.myka-stg.com',
    'local.oal-stg.com',
    'local.lal-stg.com',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myka.com', pathname: '/digital-asset/**' },
      { protocol: 'https', hostname: 'cdn.oakandluna.com', pathname: '/digital-asset/**' },
      { protocol: 'https', hostname: 'cdn.theograce.com', pathname: '/digital-asset/**' },
      { protocol: 'https', hostname: 'cdn.limeandlou.com', pathname: '/digital-asset/**' },
      { protocol: 'https', hostname: 'cdn.israelblessing.com', pathname: '/digital-asset/**' },
    ],
  },
}

export default nextConfig
