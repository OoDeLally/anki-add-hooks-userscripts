// @name         Anki Add Hooks for Google Translate
// @version      0.1
// @description  Generate a hook for AnkiConnect on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//

import * as mainPanel from './main_panel';
import * as secondaryPanel from './secondary_panel';


export const hookName = 'translate.google.com';


export const extract = ({ type, parentNode }) => {
  const sourceLanguage = document.querySelector('.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];
  const targetLanguage = document.querySelector('.tl-sugg .jfk-button-checked').innerText;
  if (type === 'mainPanel') {
    return {
      ...mainPanel.extract(),
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  }
  if (type === 'secondaryPanel') {
    return {
      ...secondaryPanel.extract(parentNode),
      frontLanguage: targetLanguage,
      backLanguage: sourceLanguage,
      cardKind: `${targetLanguage} -> ${sourceLanguage}`,
    };
  }
  throw Error(`Unknown type ${type}`);
};


export const run = (createHook) => {
  setInterval(() => {
    mainPanel.run(createHook);
    secondaryPanel.run(createHook);
  }, 500);
};
