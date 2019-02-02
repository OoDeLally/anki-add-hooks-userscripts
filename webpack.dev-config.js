const webpack = require('webpack');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
const fs = require('fs');

const webpackCommonConfig = require('./webpack.common-config');



module.exports = {
  mode: 'development',
  devtool: false,
  entry: webpackCommonConfig.entries,
  watch: true,
  output: {
    filename: '[name]_dev_hook.user.js',
    path: __dirname + '/dev-hooks',
  },
  devServer: {
    writeToDisk: true
  },
  module: {
    rules: [
      {
        test: /src\/hooks\/[^/]*.m?js/,
        use: [{
          loader: 'webpack-rollup-loader'
        }]
      },
      {
        test: __dirname + '/src/template.js',
        use: [{
          loader: 'expose-loader',
          options: 'AnkiAddHooks',
        }]
      }
    ]
  },
  plugins: [
    new ExtraWatchWebpackPlugin({
      files: [
        './generate_userscript.js',
        './generate_userscript_banner.js',
        './src/template.js',
        './src/style.css',
      ]
    }),
    new webpack.ProvidePlugin({
      identifier: 'module1',
      // ...
    }),
    new webpack.DefinePlugin({
      PLACEHOLDER_STYLE_TEXT: JSON.stringify(fs.readFileSync('./src/style.css', 'utf-8')),
    })
    // new webpack.IgnorePlugin(/^colors(\/safe)?/) // colors.js is used in node console only
  ]
};
