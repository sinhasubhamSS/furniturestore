/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // 👈 Required for Cloudinary images
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*", // frontend call
        destination: "http://localhost:5000/api/:path*", // actual backend
      },
    ];
  },
};

export default nextConfig;
