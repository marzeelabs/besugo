const chalk = require('chalk');
const exec = require('child_process').execSync;
const far = require('find-and-replace');
const fs = require('fs');
const path = require("path");

require('toml-require').install();
const netlifyToml = require("../netlify.toml");
const packageJson = require("../package.json");
const baseDir = path.resolve(__dirname, "../");
const adminDir = path.resolve(__dirname, "../" + netlifyToml.build.publish + "/admin");

let branch;
let baseurl = 'http://localhost:' + packageJson.config.port;

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

// Get the correct netlify url to use as basedir; hugo needs a correct
// basedir for building absolute urls.
if (process.env.CONTEXT !== undefined) {
  switch (process.env.CONTEXT) {
    case 'production':
      if (process.env.URL) {
        baseurl = process.env.URL;
        break;
      }

    case 'deploy-preview':
    case 'branch-deploy':
      if (process.env.DEPLOY_PRIME_URL) {
        baseurl = process.env.DEPLOY_PRIME_URL;
        break;
      }

    default:
      if (process.env.DEPLOY_URL) {
        baseurl = process.env.DEPLOY_URL;
        break;
      }
  }
}

baseurl += '/';

// Create the output directory if it doesn't exist yet
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir);
}

far
  .src('./configs/cms.yml')
  .dest(adminDir + '/config.yml')
  .replace({
    '<% CURRENT_BRANCH %>': branch
  })
  .complete(function() {
    console.log(chalk.green("Updated CMS configuration file."));
  })
  .error(function(err) {
    throw err;
  });

far
  .src('./configs/hugo.yml')
  .dest(baseDir + '/config.yml')
  .replace({
    '<% CURRENT_BASEURL %>': baseurl
  })
  .complete(function() {
    console.log(chalk.green("Updated Hugo configuration file."));
  })
  .error(function(err) {
    throw err;
  });
