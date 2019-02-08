// @name         Anki Add Hooks for Reverso
// @version      0.1
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/\w+/

import * as collinsDictionary from './collins_dictionary';
import * as mainDictionary from './main_dictionary';
import * as collaborativeDictionary from './collaborative_dictionary';


export const hookName = 'reverso.net';


export const extract = ({ type, data }) => {
  let [, sourceLanguage, targetLanguage] = window.location.href.match(/reverso\.net\/([a-z]+)-([a-z]+)\//);
  let extractedData;
  if (type === 'collinsDictionary') {
    extractedData = collinsDictionary.extract(data);
  } else if (type === 'mainDictionary') {
    extractedData = mainDictionary.extract(data);
  } else if (type === 'collaborativeDictionary') {
    extractedData = collaborativeDictionary.extract(data);
  } else {
    throw Error(`Unknown type '${type}'`);
  }
  const { reversedDirection, frontText, backText } = extractedData;
  if (reversedDirection) {
    const tmp = targetLanguage;
    targetLanguage = sourceLanguage;
    sourceLanguage = tmp;
  }
  return {
    frontText,
    backText,
    frontLanguage: sourceLanguage,
    backLanguage: targetLanguage,
    cardKind: `${sourceLanguage} -> ${targetLanguage}`,
  };
};


// There are weird "&nbsp;" spans with a white border-bottom, that make it
// ugly when we put a background. So we set them to transparent instead.
const hideNbspSpans = () => {
  document.querySelectorAll('.nbsp1').forEach((span) => {
    span.style.setProperty('border-color', 'transparent', 'important');
  });
};


export const run = (createHook) => {
  hideNbspSpans();
  collinsDictionary.run(createHook);
  mainDictionary.run(createHook);
  collaborativeDictionary.run(createHook);
};
