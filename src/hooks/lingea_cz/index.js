// @name         Anki Add Hooks for lingea.cz
// @version      2.1
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/.+/

import runOnMainPanel from './run_on_main_panel';
import runOnSecondaryPanel from './run_on_secondary_panel';
import runOnContextPanel from './run_on_context_panel';
import periodicallyTry from '../../helpers/periodically_try';

export const hookName = 'lingea.cz';

export const run = (createHook) => {
  periodicallyTry(() => {
    runOnMainPanel(createHook);
    runOnSecondaryPanel(createHook);
    runOnContextPanel(createHook);
  });
};
