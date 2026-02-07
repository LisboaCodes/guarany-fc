/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Otimizado para Docker/Coolify
  basePath: '/guarany', // Subpath da aplicação
  assetPrefix: '/guarany', // Assets também no subpath
}

module.exports = nextConfig
