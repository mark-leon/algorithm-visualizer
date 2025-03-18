const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/complaints",
        destination: "https://dev.medistack.net/api/rx-core/chief-complaints",
      },
    ];
  },
  images: {
    domains: ["s3.brilliant.com.bd"], // Add this line to allow the hostname
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
