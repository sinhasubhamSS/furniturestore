const nextConfig = {
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
