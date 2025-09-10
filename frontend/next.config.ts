const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_BASE_URL}/:path*`, // Removes duplicated /api
      },
    ];
  },
};

export default nextConfig;
