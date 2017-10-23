const glob = require("glob");
const path = require("path");
const webpack = require("webpack");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

require('toml-require').install();
const netlifyToml = require("./netlify.toml");
const packageJson = require("./package.json");

// webpack config reference:
//  https://webpack.js.org/configuration/

const allWebpacks = {
  // Watch for changes and rebuild output files as necessary
  watch: process.env.NODE_ENV === 'development',

  // For webpack-dev-server
  // Ref: https://webpack.js.org/configuration/dev-server/
  devServer: {
    contentBase: netlifyToml.build.publish,
    compress: true,
    historyApiFallback: true,
    open: true,
    port: packageJson.config.port,
    watchContentBase: true
  },

  // additional plugins
  plugins: [
    // babel-minify seems to have trouble with nested $'s, something in babel-plugin-minify-mangle-names
    // for example the following jQuery would parse error when minifying with it:
    // $a.b(function() { $('foo'); })
    //new webpack.optimize.UglifyJsPlugin()
    new UglifyJSPlugin(),

    new CopyWebpackPlugin([
      {
        from: 'temp/hugo',
        to: path.resolve(__dirname, netlifyToml.build.publish)
      }
    ])
  ]
};

module.exports = [
  Object.assign({
    // Here the application starts executing and webpack starts bundling
    entry: {
      js: glob.sync("./js/site/**/*.js"),
      admin: glob.sync("./js/admin/**/*.js")
    },

    // options related to how webpack emits results
    output: {
      // the target directory for all output files
      // must be an absolute path (use the Node.js path module)
      path: path.resolve(__dirname, netlifyToml.build.publish),

      // the filename template for entry chunks
      filename: "[name]/main.min.js"
    },

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
    }
  }, allWebpacks),

  Object.assign({
    entry: glob.sync("./jsx/**/!(Besugo)*.jsx"),

    output: {
      path: path.resolve(__dirname, netlifyToml.build.publish + "/js"),
      filename: "app.min.js"
    },

    // configuration regarding modules
    module: {
      // rules for modules (configure loaders, parser options, etc.)
      rules: [
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [ "env", "react" ]
            }
          }
        }
      ]
    },

    resolve: {
      modules: [ "node_modules", path.resolve(__dirname, "jsx") ],
      extensions: [ ".js", ".json", ".jsx" ]
    }
  }, allWebpacks)
];
