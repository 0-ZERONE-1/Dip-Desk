/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Legacy XSS filter (modern browsers ignore but older ones honor it)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information sent in requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Force HTTPS for 1 year once deployed (disable in development)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          // - Restricts where scripts, styles, images, and frames can load from
          // - Prevents XSS by blocking inline scripts (except those explicitly nonce'd by Next.js)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + next.js internals
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Styles: self + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Google profile pictures + GitHub images + ImgBB + data URIs (for avatars/icons)
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://drive.google.com https://*.googleusercontent.com https://raw.githubusercontent.com https://github.com https://*.githubusercontent.com https://i.ibb.co https://*.ibb.co",
              // Connect: self + Next.js hot reload + MongoDB Atlas (blocked by browser anyway, this is defence in depth)
              "connect-src 'self'",
              // Frames: none
              "frame-src 'none'",
              // Objects: none (no Flash etc.)
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form action: self only (prevents phishing via form hijacking)
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
