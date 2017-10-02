const glob = require("glob");
const path = require("path");
const webpack = require("webpack");

// webpack config reference:
//  https://webpack.js.org/configuration/

module.exports = [
  {
    // Here the application starts executing and webpack starts bundling
    entry: {
      js: glob.sync("./js/site/**/*.js"),
      admin: glob.sync("./js/admin/**/*.js")
    },

    // options related to how webpack emits results
    output: {
      // the target directory for all output files
      // must be an absolute path (use the Node.js path module)
      path: path.resolve(__dirname, "./static/"),

      // the filename template for entry chunks
      filename: "[name]/main.min.js"
    },

    // Watch for changes and rebuild output files as necessary
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
  }
];
