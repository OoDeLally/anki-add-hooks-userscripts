// @name         Anki Add Hooks for Reverso
// @version      2.3
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/.+/

import runOnCollinsDictionary from './run_on_collins_dictionary';
import runOnMainDictionary from './run_on_main_dictionary';
import runOnCollaborativeDictionary from './run_on_collaborative_dictionary';
import runOnContextualDictionary from './run_on_contextual_dictionary';
import { querySelectorAll } from '../../helpers/scraping';


export const hookName = 'reverso.net';


// There are weird "&nbsp;" spans with a white border-bottom, that make it
// ugly when we put a background. So we set them to transparent instead.
const hideNbspSpans = () => {
  querySelectorAll(document, '.nbsp1', { throwOnUnfound: false }).forEach((span) => {
    span.style.setProperty('border-color', 'transparent', 'important');
  });
};


export const run = (createHook) => {
  hideNbspSpans();
  runOnCollinsDictionary(createHook);
  runOnMainDictionary(createHook);
  runOnCollaborativeDictionary(createHook);
  runOnContextualDictionary(createHook);
};
