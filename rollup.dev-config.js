import fs from 'fs';
import glob from 'glob';
import userScriptCss from 'rollup-plugin-userscript-css';
import alias from 'rollup-plugin-alias';
import path from 'path';
import replace from 'rollup-plugin-replace';

const makeConfig = entryFile => ({
  input: './src/template.js',
  output: {
    file: `./dev-hooks/${path.basename(entryFile, '.js')}_dev_hook.user.js`,
    name: 'AnkiAddHooks',
    format: 'iife',
  },
  watch: {
    input: ['./src/*.js', './src/*.css'],
  },
  plugins: [
    userScriptCss(),
    alias({
      __SITE_SPECIFIC_FUNCTIONS__: `${__dirname}/${entryFile}`,
    }),
    replace({
      __CARD_STYLE__: () => fs.readFileSync('./src/card_style.css', 'utf-8').replace(/[\n\r\s]/gm, ''),
    })
  ],
});


export default glob.sync('./src/hooks/*.js').map(makeConfig);
