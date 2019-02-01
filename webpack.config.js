const webpack = require('webpack');

const webpackCommonConfig = require('./webpack.common-config');
const generateUserscriptBanner = require('./generate_userscript_banner');


module.exports = {
  mode: 'development',
  devtool: false,
  entry: webpackCommonConfig.entries,
  output: {
    filename: '[name]_hook.user.js',
    path: __dirname + '/hooks'
  },
  module: {
    rules: [
      webpackCommonConfig.babelRule
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: (context) => generateUserscriptBanner('./src/template.js', context),
      raw: true
    }),
  ]
};
