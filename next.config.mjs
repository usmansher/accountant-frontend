/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: [
            'localhost',
            'financedesk.xyz',
            'api.financedesk.xyz',
        ],
    },
}

export default nextConfig
