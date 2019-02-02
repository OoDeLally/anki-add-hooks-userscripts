const glob = require('glob');


module.exports = {

  entries: glob.sync('./src/hooks/*.js').reduce(
    (obj, val) => {obj[val.match(/\/([^/]+)\.js$/)[1]] = val; return obj}, {}
  ),

  babelRule: {
    test: __dirname + '/src/template.js',
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          ['./generate_userscript', {
            styleFile: './src/style.css'
          }]
        ]
      }
    }
  }


}
