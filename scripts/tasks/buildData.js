const Watch = require('../libs/Watch');

module.exports = Watch({
  spinner: 'buildData',

  files: [
    'scripts/buildData.js',
    'scripts/buildData/**/*.js',
  ],

  tasks: [
    {
      command: 'yarn build:data',
      text: 'processing build data...',
    },
  ],
});
