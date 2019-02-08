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


const sendAddNoteRequest = async ({
  deckName, modelName, hookName,
  frontText, frontLanguage,
  backText, backLanguage,
  onabort, onerror, onload
}) => {
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
    onabort,
    onerror,
    onload,
  });
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
  await sendAddNoteRequest({
    deckName,
    modelName,
    hookName,
    frontText,
    frontLanguage,
    backText,
    backLanguage,
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
  hookNode.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let extractedFields;
    try {
      extractedFields = siteSpecificFunctions.extract(userdata);
    } catch (error) {
      if (error.name === 'ScrappingError') {
        handleScrappingError(error);
        return;
      } else {
        throw error;
      }
    }
    if (typeof extractedFields !== 'object') {
      console.error('Found', extractedFields);
      throw Error('Provided siteSpecificFunctions.extract() fonction did not return an object');
    }
    const {
      frontText, backText, frontLanguage, backLanguage, cardKind
    } = extractedFields;
    console.log('frontText:', frontText)
    console.log('backText:', backText)
    console.log('cardKind:', cardKind)

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

    hookOnClick(
      hookNode, frontText, backText,
      frontLanguage, backLanguage,
      cardKind,
      siteSpecificFunctions.hookName
    );
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
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
