// @name         Anki Add Hooks for WordReference.com
// @version      2.5
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /https?://www\.wordreference\.com\/[a-z]{4}\/.+/

import { runOnMainTables } from './main_tables';
import { runOnCollinsRussian } from './collins_russian';



const getLanguages = () => {
  const urlMatch = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})(\/(reverse))?\//);
  if (urlMatch[4] === 'reverse') {
    // e.g. http://www.wordreference.com/czen/reverse/foobar means en -> cz
    return [urlMatch[2], urlMatch[1]];
  } else {
    // e.g. http://www.wordreference.com/czen/foobar means cz -> en
    return [urlMatch[1], urlMatch[2]];
  }
};



export const hookName = 'wordreference.com';

export const run = (createHook) => {
  const [sourceLanguage, targetLanguage] = getLanguages();
  runOnMainTables(createHook, sourceLanguage, targetLanguage);
  runOnCollinsRussian(createHook, sourceLanguage, targetLanguage);
};
