import fs from 'fs';
import _ from 'lodash';
import replace from 'rollup-plugin-replace';
import { getEntryPoints, getCommonPlugins, getMetatagLinesFromFile } from './rollup.common-config';


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
    replace({ __IS_PRODUCTION__: 'true' }),
  ]
});


export default _.map(getEntryPoints(), makeConfig);
