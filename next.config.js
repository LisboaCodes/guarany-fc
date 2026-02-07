/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Otimizado para Docker/Coolify
}

module.exports = nextConfig
