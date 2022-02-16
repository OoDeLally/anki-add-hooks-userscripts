// @name         Anki Add Hooks for Reverso
// @version      3.4
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/([\w%]+\/)?[\w%]+-[\w%]+/

import runOnMainDictionaryOneWord from './run_on_main_dictionary_one_word';
import runOnMainDictionarySentence from './run_on_main_dictionary_sentence';
import runOnCollaborativeDictionary from './run_on_collaborative_dictionary';
import runOnDictionaryContextualDictionary from './run_on_dictionary_contextual_dictionary';
import runOnContextReverso from './run_on_context_reverso';
import runOnCollinsDictionary from './run_on_collins_dictionary';


export const hookName = 'reverso.net';


export const run = (createHook) => {
  runOnContextReverso(createHook);
  runOnCollinsDictionary(createHook);

  // Reverso main dictionary has two modes, depending on wether the input is one word or a sentence.
  runOnMainDictionaryOneWord(createHook);
  runOnMainDictionarySentence(createHook);

  runOnCollaborativeDictionary(createHook);
  runOnDictionaryContextualDictionary(createHook);
};
