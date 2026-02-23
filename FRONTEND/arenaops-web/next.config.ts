import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig :NextConfig= {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.yourdomain.com",
      },
    ],
  },
};

module.exports = nextConfig;
