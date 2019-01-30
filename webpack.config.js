const generateUserscriptBanner = require('./generate_userscript_banner');
const webpack = require('webpack');
const glob = require("glob");
const extraWatchWebpackPlugin = require('extra-watch-webpack-plugin');


const entries = glob.sync('./src/hooks/*.js').reduce(
  (obj, val) => {obj[val.match(/\/([^/]+)\.js$/)[1]] = val; return obj}, {}
);

module.exports = {
  mode: 'development',
  devtool: false,
  entry: entries,
  output: {
    filename: '[name]_hook.user.js',
    path: __dirname + '/hooks'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['./generate_userscript', {
                templateFile: './src/template.js',
                styleFile: './src/style.css'
              }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: (context) => generateUserscriptBanner('./src/template.js', context),
      raw: true
    }),
    new extraWatchWebpackPlugin({
      files: [
        'src/template.js',
        'src/style.css',
      ]
    })
  ]
};
