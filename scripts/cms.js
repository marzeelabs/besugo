const exec = require('child_process').execSync;
const fs = require('fs');
const far = require('find-and-replace');

const configDir = "./public/admin";

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
    console.log("Updated CMS configuration file.");
  })
  .error(function(err) {
    console.log(err);
  });
