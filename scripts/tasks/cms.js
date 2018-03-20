const Watch = require('../libs/Watch');

module.exports = Watch({
  spinner: 'cms',

  files: [
    'scripts/cms.js',
    'cms/config.yml'
  ],

  tasks: [
    {
      command: 'yarn build:cms',
      text: 'generating config...'
    }
  ]
});
