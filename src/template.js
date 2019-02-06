/* global GM */

import './style.css';
import './card_style.css';
import * as siteSpecificFunctions from '__SITE_SPECIFIC_FUNCTIONS__'; // eslint-disable-line import/no-unresolved


const getDeckNameMapKey = cardKind => `deckName_${cardKind.toLowerCase()}`;
const getModelNameMapKey = cardKind => `modelName_${cardKind.toLowerCase()}`;

const ankiRequestOnFail = async (response, message, cardKind) => {
  console.error('Anki request response:', response);
  console.error(message);
  if (message.includes('deck was not found')) {
    await GM.setValue(getDeckNameMapKey(cardKind), null);
  }
  if (message.includes('model was not found')) {
    await GM.setValue(getModelNameMapKey(cardKind), null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
};


const ankiRequestOnSuccess = (hookNode) => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';
  hookNode.onclick = () => {};
};


const buildCardFace = (text, language, hookName) => {
  const bannerContent = [
    '<style>__CARD_STYLE__</style>', // Replaced at compilation by ./card_style.css
    `<div class="banner-hook-name">${hookName}</div>`,
  ];
  if (language) {
    bannerContent.push(`<div class="banner-language">${language}</div>`);
  }
  return `<div class="banner">${bannerContent.join('')}</div>${text}`;
};


const hookOnClick = async (
  hookNode, frontText, backText, frontLanguage, backLanguage, cardKind, hookName
) => {
  // console.log('frontText:', frontText)
  // console.log('backText:', backText)
  // console.log('cardKind:', cardKind)
  // return
  const deckNameMapKey = getDeckNameMapKey(cardKind);
  let deckName = await GM.getValue(deckNameMapKey);
  if (!deckName) {
    deckName = prompt(`Enter the name of the deck you want to add '${cardKind}' cards from this website`, 'Default');
    if (!deckName) {
      return; // Cancel
    }
    GM.setValue(deckNameMapKey, deckName);
  }
  const modelNameMapKey = getModelNameMapKey(cardKind);
  let modelName = await GM.getValue(modelNameMapKey);
  if (!modelName) {
    modelName = prompt(`Enter the name of the card model you want to create for '${cardKind}'`, 'Basic (and reversed card)');
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
          Front: buildCardFace(frontText, frontLanguage, hookName),
          Back: buildCardFace(backText, backLanguage, hookName),
        },
        tags: [siteSpecificFunctions.hookName],
      },
    },
  });
  await GM.xmlHttpRequest({
    method: 'POST',
    url: 'http://localhost:8765',
    data: dataStr,
    onabort: response => ankiRequestOnFail(response, 'Request was aborted', cardKind),
    onerror: response => ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', cardKind),
    onload: (response) => {
      const result = JSON.parse(response.responseText);
      if (result.error) {
        ankiRequestOnFail(response, result.error, cardKind);
        return;
      }
      ankiRequestOnSuccess(hookNode);
    },
  });
};


const createHook = (userdata) => {
  if (!siteSpecificFunctions.extract || typeof siteSpecificFunctions.extract !== 'function') {
    throw Error('Missing function extract()');
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
    const extractedFields = siteSpecificFunctions.extract(userdata);
    if (typeof extractedFields !== 'object') {
      console.error('Found', extractedFields);
      throw Error('Provided siteSpecificFunctions.extract() fonction did not return an object');
    }
    const {
      frontText, backText, frontLanguage, backLanguage, cardKind
    } = extractedFields;

    if (typeof frontText !== 'string') {
      console.error('Found', frontText);
      throw Error('Provided extract().frontText is not a string');
    }
    if (!frontText) {
      throw Error('Provided extract().frontText is empty');
    }
    if (typeof backText !== 'string') {
      console.error('Found', backText);
      throw Error('Provided extract().backText is not a string');
    }
    if (!backText) {
      throw Error('Provided extract().backText is empty');
    }
    if (typeof cardKind !== 'string') {
      console.error('Found', cardKind);
      throw Error('Provided extract().cardKind is not a string');
    }
    if (!cardKind) {
      throw Error('Provided extract().cardKind is empty');
    }




    hookOnClick(hookNode, frontText, backText, frontLanguage, backLanguage, cardKind, siteSpecificFunctions.hookName);
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
};


siteSpecificFunctions.run(createHook);
