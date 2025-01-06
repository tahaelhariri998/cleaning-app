import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
const withPWA = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
});


export default nextConfig;
