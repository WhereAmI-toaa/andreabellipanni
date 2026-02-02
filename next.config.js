/** @type {import('next').NextConfig} */
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const trimmedBasePath = rawBasePath.replace(/^\/+/, '').replace(/\/+$/, '')
const basePath = trimmedBasePath ? `/${trimmedBasePath}` : ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  // Explicitly configure Turbopack to avoid the Next.js 16 warning when a webpack config exists.
  turbopack: {},
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glb$/,
      type: 'asset/resource'
    })

    return config
  }
}

module.exports = nextConfig
