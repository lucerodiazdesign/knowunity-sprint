/** @type {import('next').NextConfig} */
const nextConfig = {
  // Off so the mocked timed beats (processing, verdict→hint pause, auto-reveal)
  // fire exactly once in dev instead of double-firing under StrictMode.
  reactStrictMode: false,
};

export default nextConfig;
