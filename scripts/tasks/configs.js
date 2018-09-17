const Watch = require('../libs/Watch');

module.exports = Watch({
  spinner: 'configs',

  files: [
    'scripts/configs.js',
    'configs/*.yml',
  ],

  tasks: [
    {
      command: 'yarn build:configs',
      text: 'generating configs...',
    },
  ],
});
