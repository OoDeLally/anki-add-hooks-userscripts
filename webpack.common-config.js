const glob = require('glob');


module.exports = {

  entries: glob.sync('./src/hooks/*.js').reduce(
    (obj, val) => {obj[val.match(/\/([^/]+)\.js$/)[1]] = val; return obj}, {}
  ),

  babelRule: {
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


}
