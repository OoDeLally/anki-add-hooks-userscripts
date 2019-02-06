import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { getEntryPoints, getCommonPlugins } from './rollup.common-config';


const getMetatagLinesFromFile = (filePath) => {
  const templateFileContent = fs.readFileSync(filePath, 'utf-8');
  const templateLines = templateFileContent.split(/[\n\r]+/);
  return templateLines.filter(text => /^\s*\/\/\s*@\w+\b/.test(text));
};

const createMetatags = (entryFile) => {
  let output = '// ==UserScript==\n';
  output += fs.readFileSync('./src/userscript_metatags.js', 'utf-8');
  output += `${getMetatagLinesFromFile(entryFile).join('\n')}\n`;
  output += '// ==/UserScript==\n';
  return output;
};

const makeConfig = (entryFile, entryName) => ({
  input: './src/template.js',
  output: {
    file: `./hooks/${entryName}_hook.user.js`,
    name: 'AnkiAddHooks',
    format: 'iife',
    banner: createMetatags(entryFile),
  },
  plugins: [
    ...getCommonPlugins(entryFile),
  ]
});


export default _.map(getEntryPoints(), makeConfig);
