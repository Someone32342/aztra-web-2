const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    register: true,
    sw: '/sw.js'
  },
  webpack: (config) => {
    const oneOf = config.module.rules.find(
      (rule) => typeof rule.oneOf === 'object'
    );

    const fixUse = (use) => {
      if (use.loader.indexOf('css-loader') >= 0 && use.options.modules) {
        use.options.modules.mode = 'local';
      }
    };

    if (oneOf) {
      oneOf.oneOf.forEach((rule) => {
        if (Array.isArray(rule.use)) {
          rule.use.map(fixUse);
        } else if (rule.use && rule.use.loader) {
          fixUse(rule.use);
        }
      });
    }

    if (!config.isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        "fs-extra": false
      }
    }

    config.module.rules.push(
      {
        test: /\.(md|txt)$/,
        use: 'raw-loader'
      }
    )

    return config;
  },
  reactStrictMode: true,
})