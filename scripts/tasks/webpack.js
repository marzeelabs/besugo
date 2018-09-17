const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const Spawn = require('../libs/Spawn');
const Spinner = require('../libs/Spinner');
const WebpackLoggerPlugin = require('../libs/WebpackLoggerPlugin');

module.exports = Spawn({
  spinner: 'webpack',
  restartText: 're-initializing dev server...',
  watchFile: 'webpack.config.js',

  getServer: (resolve) => {
    delete require.cache[require.resolve('../../webpack.config.js')];
    const webpackConfig = require('../../webpack.config.js');
    webpackConfig.forEach((cfg) => {
      cfg.watch = true;
    });

    // Run webpack separately to output physical files to the public directory
    // (remember the dev-server serves the assets from memory).
    // We don't care about errors in this process though, we'll fetch all of those
    // from the dev-server.
    webpack(webpackConfig.slice(0), () => {
      // We don't care about errors in this process, we'll fetch all of those
      // from the dev-server.
    });

    const devServerConfig = webpackConfig[0].devServer;
    const { port } = devServerConfig;

    // https://stackoverflow.com/questions/41213215/webpack-dev-server-not-auto-reloading
    // y tho...
    webpackConfig[1].entry.unshift(`webpack-dev-server/client?http://localhost:${port}/`);

    webpackConfig.forEach((cfg) => {
      // The webpack logger plugin handles most of the spinner's states and messages.
      cfg.plugins.push(new WebpackLoggerPlugin());
    });

    const server = new WebpackDevServer(webpack(webpackConfig), {
      ...devServerConfig,
      noInfo: true,
      quiet: true,
    });

    server.listen(port, 'localhost', (err) => {
      Spinner.error('webpack', err);
    });

    resolve();
    return server;
  },
});
