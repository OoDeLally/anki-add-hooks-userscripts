// @name         Anki Add Hooks for Google Translate
// @version      2.2
// @description  Generate a hook for AnkiConnect on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//

import runOnMainPanel from './run_on_main_panel';
import runOnSecondaryPanel from './run_on_secondary_panel';


export const hookName = 'translate.google.com';


export const run = (createHook) => {
  setInterval(() => {
    runOnMainPanel(createHook);
    runOnSecondaryPanel(createHook);
  }, 500);
};
