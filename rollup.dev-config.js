import _ from 'lodash';
import fs from 'fs';
import replace from 'rollup-plugin-replace';
import path from 'path';
import { getEntryPoints, getCommonPlugins, getMetatagLinesFromFile } from './rollup.common-config';

// Dev setup consists in two js files:
// 1- A website_com_dev_hook.user.js to install on Tampermonkey. It requires
//    the second file.
// 2- A website_com_dev_hook_required.js that will be updated on source change.
// This setup allows to edit the userscript and see the result directly on
// the website, without having to reinstall the userscript everytime.

const getRequiredScriptFileName = entryName => `${entryName}_dev_hook_required.js`;


const createUserScriptPlugin = (entryFile, entryName) => ({
  generateBundle: () => {
    let content = '// ==UserScript==\n';
    content += fs.readFileSync('./src/userscript_metatags.js', 'utf-8');
    content += `${getMetatagLinesFromFile(entryFile).join('\n')}\n`;
    const requiredFile = path.resolve(__dirname, `dev-hooks/${getRequiredScriptFileName(entryName)}`);
    content += `// @require      file://${requiredFile}\n`;
    content += '// ==/UserScript==\n';
    if (!fs.existsSync('./dev-hooks/')) {
      fs.mkdirSync('./dev-hooks/');
    }
    fs.writeFileSync(
      `./dev-hooks/${entryName}_dev_hook.user.js`,
      content
    );
  }
});

const makeConfig = (entryFile, entryName) => ({
  input: './src/template.js',
  output: {
    file: `./dev-hooks/${getRequiredScriptFileName(entryName)}`,
    name: 'AnkiAddHooks',
    format: 'iife',
  },
  watch: {
    input: ['./src/*.js', './src/*.css'],
  },
  plugins: [
    ...getCommonPlugins(entryFile),
    replace({ __IS_PRODUCTION__: 'false' }),
    createUserScriptPlugin(entryFile, entryName)
  ]
});


export default [
  ..._.map(getEntryPoints(), makeConfig),
];
