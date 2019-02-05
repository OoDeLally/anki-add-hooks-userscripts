/* global GM */

import './style.css';
import * as siteSpecificFunctions from '__SITE_SPECIFIC_FUNCTIONS__'; // eslint-disable-line import/no-unresolved


const getDeckNameMapKey = directionCode => `deckName_${directionCode.toLowerCase()}`;
const getModelNameMapKey = directionCode => `modelName_${directionCode.toLowerCase()}`;

const ankiRequestOnFail = async (response, message, directionCode) => {
  console.error('Anki request response:', response);
  console.error(message);
  if (message.includes('deck was not found')) {
    await GM.setValue(getDeckNameMapKey(directionCode), null);
  }
  if (message.includes('model was not found')) {
    await GM.setValue(getModelNameMapKey(directionCode), null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
};

const ankiRequestOnSuccess = (hookNode) => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';
  hookNode.onclick = () => {};
};

const hookOnClick = async (hookNode, frontText, backText, directionCode) => {
  // console.log('frontText:', frontText)
  // console.log('backText:', backText)
  // console.log('directionCode:', directionCode)
  // return
  const deckNameMapKey = getDeckNameMapKey(directionCode);
  let deckName = await GM.getValue(deckNameMapKey);
  if (!deckName) {
    deckName = prompt(`Enter the name of the deck you want to add '${directionCode}' cards from this website`, 'Default');
    if (!deckName) {
      return; // Cancel
    }
    GM.setValue(deckNameMapKey, deckName);
  }
  const modelNameMapKey = getModelNameMapKey(directionCode);
  let modelName = await GM.getValue(modelNameMapKey);
  if (!modelName) {
    modelName = prompt(`Enter the name of the card model you want to create for '${directionCode}'`, 'Basic (and reversed card)');
    if (!modelName) {
      return; // Cancel
    }
    await GM.setValue(modelNameMapKey, modelName);
  }
  // console.log('hookOnClick')
  const dataStr = JSON.stringify({
    action: 'addNote',
    version: 6,
    params: {
      note: {
        deckName,
        modelName,
        options: {
          allowDuplicate: true,
        },
        fields: {
          Front: frontText,
          Back: backText,
        },
        tags: [siteSpecificFunctions.hookName],
      },
    },
  });
  await GM.xmlHttpRequest({
    method: 'POST',
    url: 'http://localhost:8765',
    data: dataStr,
    onabort: response => ankiRequestOnFail(response, 'Request was aborted', directionCode),
    onerror: response => ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', directionCode),
    onload: (response) => {
      const result = JSON.parse(response.responseText);
      if (result.error) {
        ankiRequestOnFail(response, result.error);
        return;
      }
      ankiRequestOnSuccess(hookNode);
    },
  });
};


const createHook = (userdata) => {
  if (!siteSpecificFunctions.extractFrontText || typeof siteSpecificFunctions.extractFrontText !== 'function') {
    throw Error('Missing function extractFrontText()');
  }
  if (!siteSpecificFunctions.extractBackText || typeof siteSpecificFunctions.extractBackText !== 'function') {
    throw Error('Missing function extractBackText()');
  }
  if (!siteSpecificFunctions.hookName || typeof siteSpecificFunctions.hookName !== 'string') {
    throw Error('Missing string property `hookName`');
  }
  const starNodeBig = document.createElement('div');
  starNodeBig.innerText = '★';
  starNodeBig.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-small';
  const textNode = document.createElement('span');
  textNode.className = '-anki-quick-adder-hook-text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', siteSpecificFunctions.hookName);
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const frontText = siteSpecificFunctions.extractFrontText(userdata);
    if (typeof frontText !== 'string') {
      console.error('Found', frontText);
      throw Error('Provided siteSpecificFunctions.extractFrontText() fonction did not return a string');
    }
    if (!frontText) {
      throw Error('extractFrontText() returned an empty string');
    }
    const backText = siteSpecificFunctions.extractBackText(userdata);
    if (typeof backText !== 'string') {
      console.error('Found', backText);
      throw Error('Provided siteSpecificFunctions.extractBackText() fonction did not return a string');
    }
    if (!backText) {
      throw Error('extractBackText() returned an empty string');
    }
    const directionCode = siteSpecificFunctions.extractDirection(userdata);
    if (typeof directionCode !== 'string') {
      console.error('Found', directionCode);
      throw Error('Provided siteSpecificFunctions.extractDirection() fonction did not return a string');
    }
    hookOnClick(hookNode, frontText, backText, directionCode);
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
};


siteSpecificFunctions.run(createHook);
