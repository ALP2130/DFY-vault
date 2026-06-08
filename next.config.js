/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Anthropic API calls from server only
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

module.exports = nextConfig;
