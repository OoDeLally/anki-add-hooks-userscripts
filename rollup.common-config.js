import fs from 'fs';
import path from 'path';
import userScriptCss from 'rollup-plugin-userscript-css';
import alias from 'rollup-plugin-alias';
import replace from 'rollup-plugin-replace';
import glob from 'glob';
import resolve from 'resolve';

import packageJson from './package.json';


export const getMetatagLinesFromFile = (filePath) => {
  const templateFileContent = fs.readFileSync(filePath, 'utf-8');
  const templateLines = templateFileContent.split(/[\n\r]+/);
  return templateLines.filter(text => /^\s*\/\/\s*@\w+\b/.test(text));
};

const getUserscriptVersion = (entryFile) => {
  const versionMetatag = getMetatagLinesFromFile(entryFile).find(line => /@version\b/.test(line));
  if (!versionMetatag) {
    throw Error('Please specify a @version metatag');
  }
  const version = versionMetatag.match(/@version\s+(.+)\s*/)[1];
  if (!version) {
    throw Error('Please specify a @version metatag');
  }
  return version;
};


export const getCommonPlugins = entryFile => [
  userScriptCss(),
  alias({
    __SITE_SPECIFIC_FUNCTIONS__: path.resolve(__dirname, entryFile),
  }),
  replace({
    __CARD_STYLE__: () => fs.readFileSync('./src/card_style.css', 'utf-8').replace(/[\n\r\s]/gm, ''),
    __PROJECT_GITHUB_ISSUES_URL__: packageJson.bugs.url,
    __ANKI_ADD_HOOKS_VERSION__: packageJson.version,
    __USERSCRIPT_VERSION__: getUserscriptVersion(entryFile),
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
