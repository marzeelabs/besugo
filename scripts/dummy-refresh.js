// webpack-dev-server's watchContentBase option does not recursively watch all
// files in the directory. This file creates/rewrites an empty dummy.txt file at
// the root of the build directory, so that WDS catches the change and refreshes
// the pages in the browser automatically.

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

require('toml-require').install();
const netlifyToml = require('../netlify.toml');

fs.writeFile(path.resolve(netlifyToml.build.publish, 'dummy'), 'contents', (err) => {
  if (err) {
    console.log(chalk.red(err));
  }
});
