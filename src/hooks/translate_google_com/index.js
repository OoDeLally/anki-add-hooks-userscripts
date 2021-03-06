// @name         Anki Add Hooks for Google Translate
// @version      2.3
// @description  Generate a hook for AnkiConnect on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//

import runOnMainPanel from './run_on_main_panel';
import runOnSecondaryPanel from './run_on_secondary_panel';


export const hookName = 'translate.google.com';

/**
  26 Jan 2021: The page uses iframes, for this reason the script is run once in each iframe.
  Make sure the script exits gracefully if nothing is found.
*/

export const run = (createHook) => {
  setInterval(() => {
    try {
      runOnMainPanel(createHook);
    } catch (error) {
      console.warn(error);
    }
    try {
      runOnSecondaryPanel(createHook);
    } catch (error) {
      console.warn(error);
    }
  }, 500);
};
