// Until static-site-generator-webpack-plugin is updated for Webpack 4, this is
// a workaround to avoid deprecation warnings in the console.

const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

StaticSiteGeneratorPlugin.prototype._apply = StaticSiteGeneratorPlugin.prototype.apply;

StaticSiteGeneratorPlugin.prototype.apply = function apply(compiler) {
  const plugin = { name: 'StaticSiteGeneratorPlugin' };

  this._apply({
    plugin(_, compilerCallback) {
      compiler.hooks.thisCompilation.tap(plugin, (compilation) => {
        compilation._plugin = compilation.plugin;

        compilation.plugin = (__, compilationCallback) => {
          compilation.hooks.optimizeAssets.tapAsync(plugin, (___, done) => {
            compilationCallback(___, done);
          });
        };

        compilerCallback(compilation);
      });
    },
  });
};

module.exports = StaticSiteGeneratorPlugin;
