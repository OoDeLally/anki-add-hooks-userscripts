const generateUserscriptBanner = require('./generate_userscript_banner');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    lingea_cz: './src/lingea_cz.js',
  },
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
    })
  ]
};
