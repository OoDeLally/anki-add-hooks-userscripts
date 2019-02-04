import glob from 'glob';
import userScriptCss from 'rollup-plugin-userscript-css';
import alias from 'rollup-plugin-alias';
import path from 'path';


const makeConfig = entryFile => ({
  input: './src/template.js',
  output: {
    file: `./dev-hooks/${path.basename(entryFile, '.js')}_dev_hook.user.js`,
    name: 'AnkiAddHooks',
    format: 'iife',
  },
  watch: {
    input: ['./src/*.js', './src/style.css'],
  },
  plugins: [
    userScriptCss(),
    alias({
      __SITE_SPECIFIC_FUNCTIONS__: `${__dirname}/${entryFile}`,
    }),
  ],
});


export default glob.sync('./src/hooks/*.js').map(makeConfig);
