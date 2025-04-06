// @name         Anki Add Hooks for WordReference.com
// @version      2.8
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /https?:\/\/www\.wordreference\.com\/(([a-z]{4}\/.+)|([a-z]{2}(\/[a-z]{2})?\/translation.asp\b.*))/

import { runOnMainTables } from './main_tables';
import { runOnCollinsRussian } from './collins_russian';


// e.g. https://www.wordreference.com/es/translation.asp?tranword=food
const getLanguagesFromSpanishUrl = () => {
  const urlMatch = window.location.href.match(/wordreference\.com\/([a-z]{2})(\/([a-z]{2}))?\/translation\.asp/);
  if (!urlMatch) {
    return undefined;
  }
  const firstLanguage = urlMatch[1];
  const secondLanguage = urlMatch[3] || 'en';
  return [firstLanguage, secondLanguage];
};


// e.g. https://www.wordreference.com/fren/oui
const getLanguagesFromNormalUrl = () => {
  const urlMatch = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})(\/(reverse))?\//);
  if (!urlMatch) {
    return undefined;
  }
  if (urlMatch[4] === 'reverse') {
    // e.g. http://www.wordreference.com/czen/reverse/foobar means en -> cz
    return [urlMatch[2], urlMatch[1]];
  } else {
    // e.g. http://www.wordreference.com/czen/foobar means cz -> en
    return [urlMatch[1], urlMatch[2]];
  }
};


const getLanguages = () => getLanguagesFromNormalUrl() || getLanguagesFromSpanishUrl();


export const hookName = 'wordreference.com';

export const run = (createHook) => {
  const urlMatch = getLanguages();
  if (!urlMatch) {
    console.error('Could not match the URL. Giving up.');
    return;
  }
  const [sourceLanguage, targetLanguage] = urlMatch;
  runOnMainTables(createHook, sourceLanguage, targetLanguage);
  runOnCollinsRussian(createHook, sourceLanguage, targetLanguage);
};
