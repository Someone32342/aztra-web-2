module.exports = {
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
      config.node = {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        "fs-extra": 'empty'
      }
    }

    config.module.rules.push(
      {
        test: /\.md$/,
        use: 'raw-loader'
      }
    )

    return config;
  },
  reactStrictMode: true
};