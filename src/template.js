import './style.css';
import './card_style.css';
import * as siteSpecificFunctions from '__SITE_SPECIFIC_FUNCTIONS__'; // eslint-disable-line import/no-unresolved
import { ANKI_ADD_BUTTON_CLASS } from './constants';


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
  hookNode.classList.add('-anki-add-hook-added');
  hookNode.querySelector('.-anki-add-hook-text').innerText = 'Added';
  hookNode.onclick = () => {};
};


const buildCardFace = (htmlContent, language, hookName) => {
  const bannerContent = [
    '<style>__CARD_STYLE__</style>', // Replaced at compilation by ./card_style.css
    `<div class="banner-hook-name">${hookName}</div>`,
  ];
  if (language) {
    bannerContent.push(`<div class="banner-language">${language}</div>`);
  }
  return `<div class="banner">
            ${bannerContent.join('')}
          </div>
          <div style="text-align:center;width:100%;">
          ${htmlContent}
          </div>
        `;
};


const handleScrappingError = (error) => {
  const productionExtraMessage = `
    Please report the following infos at:
    __PROJECT_GITHUB_ISSUES_URL__`;
  console.error(
    `AnkiAddHooks: Error during web page scrapping. ${
      __IS_PRODUCTION__ ? productionExtraMessage : ''
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: __ANKI_ADD_HOOKS_VERSION__.

     Hook Userscript Name: ${siteSpecificFunctions.hookName}.

     Hook UserScript Version: __USERSCRIPT_VERSION__.

     Stack: ${error.stack}
    `
  );
  if (__IS_PRODUCTION__) {
    alert(`AnkiAddHooks Error
          There was an error in reading the web page.
          You can help us solve it:
          1- Open the console (F12 key => tab "Console").
          2- Copy the error message.
          3- Paste the error message in a github issue at the url mentioned in the error message.
          Thank you.
    `);
  }
};


// Extract the data from the web page
const extractPageFields = (userdata) => {
  const extractedFields = siteSpecificFunctions.extract(userdata);
  if (typeof extractedFields !== 'object') {
    console.error('Found', extractedFields);
    throw Error('Provided siteSpecificFunctions.extract() fonction did not return an object');
  }
  const {
    frontText, backText, cardKind
  } = extractedFields;
  // console.log('frontText:', frontText)
  // console.log('backText:', backText)
  // console.log('cardKind:', cardKind)

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
  return extractedFields;
};


// Associate a deck to the kind of card
const getDeckName = async (cardKind) => {
  const deckNameMapKey = getDeckNameMapKey(cardKind);
  let deckName = await GM.getValue(deckNameMapKey);
  if (!deckName) {
    deckName = prompt(`Enter the name of the deck you want to add '${cardKind}' cards from this website`, 'Default');
    if (!deckName) {
      throw Error('Adding was cancelled');
    }
    GM.setValue(deckNameMapKey, deckName);
  }
  return deckName;
};

// Associate a card model to the kind of card
const getModelName = async (cardKind) => {
  const modelNameMapKey = getModelNameMapKey(cardKind);
  let modelName = await GM.getValue(modelNameMapKey);
  if (!modelName) {
    modelName = prompt(`Enter the name of the card model you want to create for '${cardKind}'`, 'Basic (and reversed card)');
    if (!modelName) {
      throw Error('Adding was cancelled');
    }
    await GM.setValue(modelNameMapKey, modelName);
  }
  return modelName;
};


const AnkiCardAddingError = (message, response) => {
  const error = Error(message);
  error.name = 'AnkiCardAddingError';
  error.response = response;
  return error;
};


const ankiConnectRequest = (action, params) =>
  new Promise(
    async (resolve, reject) =>
      GM.xmlHttpRequest({
        method: 'POST',
        url: 'http://localhost:8765',
        data: JSON.stringify({ action, version: 6, params }),
        onabort: (response) => {
          reject(AnkiCardAddingError('Request was aborted', response));
        },
        onerror: (response) => {
          reject(AnkiCardAddingError(
            'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.',
            response
          ));
        },
        onload: (response) => {
          const result = JSON.parse(response.responseText);
          if (result.error) {
            reject(AnkiCardAddingError(result.error, response));
            return;
          }
          resolve(response.responseText);
        },
      })
  );


const ankiConnectAddRequest = async fields =>
  ankiConnectRequest('addNote', {
    note: {
      deckName: await getDeckName(fields.cardKind),
      modelName: await getModelName(fields.cardKind),
      options: {
        allowDuplicate: true,
      },
      fields: {
        Front: buildCardFace(
          fields.frontText,
          fields.frontLanguage,
          siteSpecificFunctions.hookName
        ),
        Back: buildCardFace(
          fields.backText,
          fields.backLanguage,
          siteSpecificFunctions.hookName
        ),
      },
      tags: [siteSpecificFunctions.hookName],
    },
  });


const onHookClick = async (event, userdata, hookNode) => {
  event.preventDefault();
  event.stopPropagation();
  let fields;
  try {
    fields = extractPageFields(userdata);
    await ankiConnectAddRequest(fields);
    ankiRequestOnSuccess(hookNode);
  } catch (error) {
    if (error.name === 'ScrappingError') {
      handleScrappingError(error);
    } else if (error.name === 'AnkiCardAddingError') {
      ankiRequestOnFail(error.response, error.message, fields.cardKind);
    } else {
      throw error;
    }
  }
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
  starNodeBig.className = '-anki-add-hook-star -anki-add-hook-star-big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '-anki-add-hook-star -anki-add-hook-star-small';
  const textNode = document.createElement('span');
  textNode.className = '-anki-add-hook-text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', siteSpecificFunctions.hookName);
  hookNode.className = ANKI_ADD_BUTTON_CLASS;
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  hookNode.onclick = event => onHookClick(event, userdata, hookNode);
  return hookNode;
};


try {
  siteSpecificFunctions.run(createHook);
} catch (error) {
  if (error.name === 'ScrappingError') {
    handleScrappingError(error);
  } else {
    throw error;
  }
}
