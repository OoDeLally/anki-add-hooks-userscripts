// @name         Anki Add Hooks for Reverso
// @version      0.1
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/\w+/


const getLanguageCodes = () => {
  const match = window.location.href.match(/reverso\.net\/([a-z]+)-([a-z]+)\//);
  if (!match) {
    throw Error('Failed to get language codes');
  }
  return [match[1], match[2]];
};


const extractMainTranslationFrontText = () => {
  const word = document.querySelector('h2').innerText;
  if (!word) {
    throw Error('Could not find source word');
  }
  const text = `${getLanguageCodes()[0]}\n${word}`;
  return text;
};

const extractMainTranslationBackText = () => {
  const blocks = Array.from(document.querySelectorAll('#TableHTMLResult div')).filter(div => div.getAttribute('border') === '1');
  blocks.shift(); // The first block is the source word.
  const text = `${getLanguageCodes()[1]}\n${blocks.map(block => block.innerText).join('\n')}`;
  return text;
};

const extractCollaborativeTranslationFrontText = (parentNode) => {
  const word = parentNode.querySelector('.CDResSource').innerText;
  const text = `${getLanguageCodes()[0]}\n${word}`;
  return text;
};

const extractCollaborativeTranslationBackText = (parentNode) => {
  const word = parentNode.querySelector('.CDResTarget').innerText;
  const text = `${getLanguageCodes()[1]}\n${word}`;
  return text;
};


export const hookName = 'reverso.net';


export const extractFrontText = ({ type, parentNode }) => {
  if (type === 'mainDictionary') {
    return extractMainTranslationFrontText();
  }
  if (type === 'collaborativeDictionary') {
    return extractCollaborativeTranslationFrontText(parentNode);
  }
  throw Error(`Unknown type ${type}`);
};

export const extractBackText = ({ type, parentNode }) => {
  if (type === 'mainDictionary') {
    return extractMainTranslationBackText();
  }
  if (type === 'collaborativeDictionary') {
    return extractCollaborativeTranslationBackText(parentNode);
  }
  throw Error(`Unknown type ${type}`);
};

export const extractDirection = () => {
  const languageCodes = getLanguageCodes();
  return `${languageCodes[0]} -> ${languageCodes[1]}`;
};


export const run = (createHook) => {
  // There are two translation providers in reverso.
  // 1- the main reverso dictionary
  // 2- the collaborative dictionary

  // 1- real reverso dictionary
  const mainDictionarySourceNode = document.querySelector('h2');
  if (mainDictionarySourceNode) {
    const hook = createHook({type: 'mainDictionary'});
    hook.style.position = 'absolute';
    hook.style.right = '150px';
    hook.style.top = '10px';
    mainDictionarySourceNode.parentNode.append(hook);
  }

  // 2- collaborative dictionary
  const collaborativeDefinitionsRows = Array.from(document.querySelectorAll('.CDResTable tr')).filter(tr => tr.getAttribute('valign') === 'top');
  collaborativeDefinitionsRows.forEach((rowNode) => {
    const hook = createHook({ type: 'collaborativeDictionary', parentNode: rowNode });
    hook.style.position = 'absolute';
    hook.style.left = '105px';
    const parentNode = rowNode.querySelector('.CDResAct');
    parentNode.style.position = 'relative';
    parentNode.append(hook);
  });
};
