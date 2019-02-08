import _ from 'lodash';
import replace from 'rollup-plugin-replace';
import { getEntryPoints, getCommonPlugins } from './rollup.common-config';

const makeConfig = (entryFile, entryName) => ({
  input: './src/template.js',
  output: {
    file: `./dev-hooks/${entryName}_dev_hook.user.js`,
    name: 'AnkiAddHooks',
    format: 'iife',
  },
  watch: {
    input: ['./src/*.js', './src/*.css'],
  },
  plugins: [
    ...getCommonPlugins(entryFile),
    replace({ __IS_PRODUCTION__: 'false' }),
  ]
});

export default _.map(getEntryPoints(), makeConfig);
