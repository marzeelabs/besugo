const Spawn = require('../libs/Spawn');

module.exports = Spawn({
  spinner: 'sharp',
  restartText: 're-initializing sharp runner...',
  watchFile: 'scripts/sharp.js',

  getServer: (resolve) => {
    delete require.cache[require.resolve('../sharp.js')];

    // The sharp runner script handles the spinner states by itself.
    const server = require('../sharp.js');
    server.setCallback(resolve);

    return server;
  },
});
