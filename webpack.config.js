const glob = require("glob");
const path = require("path");
const webpack = require("webpack");
const exec = require('child_process').execSync;

// webpack config reference:
//  https://webpack.js.org/configuration/

const jsWebpacks = {
  watch: process.env.SERVE === 'true',

  // configuration regarding modules
  module: {
    // rules for modules (configure loaders, parser options, etc.)
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [ "env" ]
          }
        }
      }
    ]
  },

  // additional plugins
  plugins: [
    // babel-minify seems to have trouble with nested $'s, something in babel-plugin-minify-mangle-names
    // for example the following jQuery would parse error when minifying with it:
    // $a.b(function() { $('foo'); })
    new webpack.optimize.UglifyJsPlugin()
  ]
};
console.log("git:"+exec("$(git symbolic-ref --short -q HEAD)"));
console.log("head:"+process.env.$HEAD);
module.exports = [
  Object.assign({
    // Here the application starts executing and webpack starts bundling
    entry: glob.sync("./js/site/**/*.js"),

    // options related to how webpack emits results
    output: {
      // the target directory for all output files
      // must be an absolute path (use the Node.js path module)
      path: path.resolve(__dirname, "./static/js/"),

      // the filename template for entry chunks
      filename: "site.min.js"
    },
  }, jsWebpacks),

  Object.assign({
    entry: glob.sync("./js/admin/**/*.js"),

    output: {
      path: path.resolve(__dirname, "./static/admin/"),
      filename: "admin.min.js"
    },
  }, jsWebpacks)
];
