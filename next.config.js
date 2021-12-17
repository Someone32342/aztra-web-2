const withPWA = require('next-pwa');

module.exports = withPWA({
  swcMinify: true,
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    register: true,
    sw: '/sw.js',
  },
  webpack: (config) => {
    const oneOf = config.module.rules.find(
      (rule) => typeof rule.oneOf === 'object'
    );

    if (!config.isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        'fs-extra': false,
      };
    }

    config.module.rules.push({
      test: /\.(md|txt)$/,
      use: 'raw-loader',
    });

    return config;
  },
  reactStrictMode: true,
  images: {
    domains: ['cdn.discord.com', 'cdn.discordapp.com'],
  },
});
