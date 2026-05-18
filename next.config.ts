import type { NextConfig } from 'next'

// Ensure node is findable by Turbopack's child process spawner
process.env.PATH = `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH ?? ''}`

const nextConfig: NextConfig = {
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
