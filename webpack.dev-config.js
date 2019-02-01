const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const webpackCommonConfig = require('./webpack.common-config');


module.exports = {
  mode: 'development',
  devtool: false,
  entry: webpackCommonConfig.entries,
  watch: true,
  output: {
    filename: '[name]_dev_hook.user.js',
    path: __dirname + '/dev-hooks'
  },
  devServer: {
    writeToDisk: true
  },
  module: {
    rules: [
      webpackCommonConfig.babelRule
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
  ]
};
