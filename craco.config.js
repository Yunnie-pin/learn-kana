module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const workboxPlugin = webpackConfig.plugins.find(
        (plugin) => plugin.constructor.name === 'InjectManifest'
      );

      if (workboxPlugin) {
        workboxPlugin.config.exclude = [
          ...workboxPlugin.config.exclude,
          /static\/media\/(?:KleeOne-Regular|NotoSerifJP-Regular|ShipporiMincho-Regular|YujiBoku-Regular)\./,
        ];
      }

      return webpackConfig;
    },
  },
};
