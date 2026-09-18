/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Client ad-performance reports are served by the cpn-integrations project,
  // which owns the reporting store and the Supabase credentials. Proxying them
  // under this domain keeps the client-facing URL on conversionpartners.net
  // without a second domain, a DNS record, or a copy of the renderer here.
  //
  // beforeFiles so nothing in the app router can claim /reports/... first. The
  // token is the only credential the report has, and Next forwards the query
  // string, so the month links in the report footer keep working through the
  // proxy.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/reports/:token',
          destination: 'https://cpn-integrations.vercel.app/r/:token',
        },
      ],
    }
  },
}

export default nextConfig
