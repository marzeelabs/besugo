const chalk = require('chalk');
const exec = require('child_process').execSync;
const far = require('find-and-replace');
const fs = require('fs');
const path = require("path");

require('toml-require').install();
const netlifyToml = require("../netlify.toml");
const configDir = path.resolve(__dirname, "../" + netlifyToml.build.publish + "/admin");

let branch;
try {
  // In local development we get the branch directly from git
  branch = exec("git symbolic-ref --short -q HEAD").toString();
}
catch(ex) {}
if(!branch) {
  // If we're deploying on Netlify, use $HEAD env var
  // Fallback to develop
  branch = process.env.HEAD || 'develop';
}

// Make sure there are no linebreaks in the string
branch = branch.replace(/\r?\n|\r/g, "");

// Create the output directory if it doesn't exist yet
if(!fs.existsSync(configDir)){
  fs.mkdirSync(configDir);
}

far
  .src('./cms/config.yml')
  .dest(configDir + '/config.yml')
  .replace({
    '<% CURRENT_BRANCH %>': branch
  })
  .complete(function() {
    console.log(chalk.green("Updated CMS configuration file."));
  })
  .error(function(err) {
    throw err;
  });
