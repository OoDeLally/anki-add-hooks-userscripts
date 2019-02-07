// @name         Anki Add Hooks for Reverso
// @version      0.1
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/\w+/

import * as collins from './collins';


const extractMainTranslationFrontText = () => {
  const word = document.querySelector('h2').innerText;
  if (!word) {
    throw Error('Could not find source word');
  }
  return word;
};

const extractMainTranslationBackText = () => {
  const blocks = Array.from(document.querySelectorAll('#TableHTMLResult div'))
    .filter(div => div.getAttribute('border') === '1');
  blocks.shift(); // The first block is the source word.
  return blocks.map(block => block.innerText).join('\n');
};

const extractCollaborativeTranslationFrontText = (parentNode) => {
  const word = parentNode.querySelector('.CDResSource').innerText;
  return word;
};

const extractCollaborativeTranslationBackText = (parentNode) => {
  const word = parentNode.querySelector('.CDResTarget').innerText;
  return word;
};


export const hookName = 'reverso.net';


export const extract = ({ type, data }) => {
  let [, sourceLanguage, targetLanguage] = window.location.href.match(/reverso\.net\/([a-z]+)-([a-z]+)\//);
  let extractedData;
  if (type === 'collins') {
    extractedData = collins.extract(data);
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
  collins.run(createHook);

  // const collaborativeDefinitionsRows = Array.from(document.querySelectorAll('.CDResTable tr')).filter(tr => tr.getAttribute('valign') === 'top');
  // collaborativeDefinitionsRows.forEach((rowNode) => {
  //   const hook = createHook({ type: 'collaborativeDictionary', parentNode: rowNode });
  //   hook.style.position = 'absolute';
  //   hook.style.left = '105px';
  //   const parentNode = rowNode.querySelector('.CDResAct');
  //   parentNode.style.position = 'relative';
  //   parentNode.append(hook);
  // });
};
