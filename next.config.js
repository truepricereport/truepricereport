/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    unoptimized: true,
    domains: [
      "truepricereport.s3.us-west-1.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "truepricereport.s3.us-west-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
