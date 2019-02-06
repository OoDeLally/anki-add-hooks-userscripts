import fs from 'fs';
import path from 'path';
import userScriptCss from 'rollup-plugin-userscript-css';
import alias from 'rollup-plugin-alias';
import replace from 'rollup-plugin-replace';
import glob from 'glob';
import resolve from 'resolve';


export const getCommonPlugins = entryFile => [
  userScriptCss(),
  alias({
    __SITE_SPECIFIC_FUNCTIONS__: path.resolve(__dirname, entryFile),
  }),
  replace({
    __CARD_STYLE__: () => fs.readFileSync('./src/card_style.css', 'utf-8').replace(/[\n\r\s]/gm, ''),
  })
];


const isDirectory = file => fs.statSync(file).isDirectory();

const isJsFile = file => /.m?js$/.test(file);


export const getEntryPoints = () =>
  glob.sync('./src/hooks/*')
    .filter(file => isDirectory(file) || isJsFile(file))
    .reduce((obj, file) => {
      obj[path.basename(file, '.js')] = resolve.sync(file);
      return obj;
    }, {});
