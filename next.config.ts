import type { NextConfig } from 'next'

// Ensure node is findable by Turbopack's child process spawner
process.env.PATH = `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH ?? ''}`

const nextConfig: NextConfig = {}

export default nextConfig
