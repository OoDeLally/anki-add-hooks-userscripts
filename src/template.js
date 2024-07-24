import './style.css';
import './card_style.css';
import * as siteSpecificFunctions from '__SITE_SPECIFIC_FUNCTIONS__'; // eslint-disable-line import/no-unresolved
import {
  ANKI_ADD_BUTTON_CLASS,
  ANKI_HOOK_BUTTON_LOADING_CLASS,
  ANKI_HOOK_BUTTON_ERROR_CLASS,
  ANKI_HOOK_BUTTON_ADDED_CLASS,
  ANKI_HOOK_BUTTON_TEXT_CLASS,
  ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR,
} from './constants';
import onScrapingError from './on_scraping_error';


const AnkiConnectError = (message, response) => {
  const error = Error(message);
  error.name = 'AnkiConnectError';
  error.response = response;
  return error;
};

const CancelledError = (message = null) => {
  const error = Error(message);
  error.name = 'CancelledError';
  return error;
};


const getDeckNameMapKey = cardKind => `deckName_${cardKind.toLowerCase()}`;
const getModelNameMapKey = cardKind => `modelName_${cardKind.toLowerCase()}`;


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


const ankiConnectRequest = (action, params) =>
  new Promise(
    async (resolve, reject) =>
      GM.xmlHttpRequest({
        method: 'POST',
        url: 'http://localhost:8765',
        data: JSON.stringify({ action, version: 6, params }),
        onabort: (response) => {
          console.error(response);
          reject(AnkiConnectError('Request was aborted'));
        },
        onerror: (response) => {
          console.error(response);
          reject(AnkiConnectError(
            `Could not connect to Anki Desktop. Please make sure that:
    - Anki Desktop is running.
    - AnkiConnect add-on is installed on Anki Desktop.
    - Anki Desktop was restarted after installing AnkiConnect add-on.`
          ));
        },
        onload: (response) => {
          const reponseJson = JSON.parse(response.responseText);
          if (reponseJson.error) {
            reject(AnkiConnectError(reponseJson.error));
            return;
          }
          resolve(reponseJson.result);
        },
      })
  );

const ankiConnectGetDecksRequest = async () =>
  ankiConnectRequest('deckNames');

const ankiConnectGetModelsRequest = async () =>
  ankiConnectRequest('modelNames');

const ankiConnectGetModelFieldNamesRequest = async modelName =>
  ankiConnectRequest('modelFieldNames', { modelName });


const promptDeckList = async (cardKind) => {
  const availableDecks = await ankiConnectGetDecksRequest();
  if (availableDecks.length === 0) {
    throw AnkiConnectError('No deck are available. Please create one on Anki first.');
  }
  if (availableDecks.length === 1) {
    return availableDecks[0];
  }
  let chosenDeckIndex = null;
  while (chosenDeckIndex === null) {
    const chosenDeckIndexStr = prompt(
      `Adding card of type:\n       [ ${cardKind} ]\n`
      + `${availableDecks.length} decks have been found on your Anki account:\n`
      + `${availableDecks.map((deckName, deckIndex) => `        ${deckIndex + 1} - ${deckName}\n`).join('')}`
      + 'Enter the index (e.g. "1") of the deck you want:'
    );
    if (chosenDeckIndexStr == null) {
      throw CancelledError();
    }
    const index = parseInt(chosenDeckIndexStr, 10);
    if (!Number.isNaN(index) && index >= 1 && index <= availableDecks.length) {
      chosenDeckIndex = index - 1;
    }
  }
  return availableDecks[chosenDeckIndex];
};


// Associate a deck to the kind of card
const getDeckName = async (cardKind) => {
  const deckNameMapKey = getDeckNameMapKey(cardKind);
  let deckName = await GM.getValue(deckNameMapKey);
  if (!deckName) {
    deckName = await promptDeckList(cardKind);
    GM.setValue(deckNameMapKey, deckName);
  }
  return deckName;
};


const promptModelList = async (cardKind) => {
  const availableModels = await ankiConnectGetModelsRequest();
  if (availableModels.length === 0) {
    throw AnkiConnectError('No model are available. Please create one on Anki first.');
  }
  if (availableModels.length === 1) {
    return availableModels[0];
  }
  let choseModelIndex = null;
  while (choseModelIndex === null) {
    const choseModelIndexStr = prompt(
      `Adding card of type:\n       [ ${cardKind} ]\n`
      + `${availableModels.length} models have been found on your Anki account:\n`
      + `${availableModels.map((modelName, modelIndex) => `        ${modelIndex + 1} - ${modelName}\n`).join('')}`
      + 'Enter the index (e.g. "1") of the model you want:'
    );
    if (choseModelIndexStr == null) {
      throw CancelledError();
    }
    const index = parseInt(choseModelIndexStr, 10);
    if (!Number.isNaN(index) && index >= 1 && index <= availableModels.length) {
      choseModelIndex = index - 1;
    }
  }
  return availableModels[choseModelIndex];
};


// Associate a card model to the kind of card
const getModelName = async (cardKind) => {
  const modelNameMapKey = getModelNameMapKey(cardKind);
  let modelName = await GM.getValue(modelNameMapKey);
  if (!modelName) {
    modelName = await promptModelList(cardKind);
    if (!modelName) {
      throw CancelledError();
    }
    await GM.setValue(modelNameMapKey, modelName);
  }
  return modelName;
};


const ankiConnectAddNoteRequest = async (fields) => {
  const deckName = await getDeckName(fields.cardKind);
  const modelName = await getModelName(fields.cardKind);
  const modelFields = await ankiConnectGetModelFieldNamesRequest(modelName);
  if (modelFields.length !== 2) {
    throw AnkiConnectError(
      `Your model [ ${modelName} ] uses ${modelFields.length} fields: ${modelFields.map(field => `[ ${field} ]`).join(', ')}.\n`
      + 'Please use a model with exactly two fields.'
    );
  }
  return ankiConnectRequest('addNote', {
    note: {
      deckName,
      modelName,
      options: {
        allowDuplicate: false,
      },
      fields: {
        [modelFields[0]]: buildCardFace(
          fields.frontText,
          fields.frontLanguage,
          siteSpecificFunctions.hookName
        ),
        [modelFields[1]]: buildCardFace(
          fields.backText,
          fields.backLanguage,
          siteSpecificFunctions.hookName
        ),
      },
      tags: [siteSpecificFunctions.hookName],
    },
  });
};


const ankiAddNoteRequestOnFail = async (message, cardKind) => {
  console.error(message);
  if (message.includes('deck was not found')) {
    await GM.setValue(getDeckNameMapKey(cardKind), null);
  }
  if (message.includes('model was not found')) {
    await GM.setValue(getModelNameMapKey(cardKind), null);
  }
  alert(message);
};


const ankiAddNoteRequestOnSuccess = (hookNode) => {
  hookNode.onclick = () => {};
};


const wait = async ms => new Promise(resolve => setTimeout(resolve, ms));

const updateButtonState = async (hook, state) => {
  if (state === 'available') {
    hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
    hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Add';
  } else if (state === 'loading') {
    hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
    hook.classList.add(ANKI_HOOK_BUTTON_LOADING_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
    hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Add';
  } else if (state === 'added') {
    hook.classList.add(ANKI_HOOK_BUTTON_ADDED_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
    hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Added';
  } else if (state === 'error') {
    hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
    hook.classList.add(ANKI_HOOK_BUTTON_ERROR_CLASS);
    hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
    hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Error';
  } else {
    throw Error(`Unknwown state ${state}`);
  }
  await wait(100); // Leave time for the button style to be updated
};


const verifyExtractedFields = (extractedFields) => {
  if (typeof extractedFields !== 'object') {
    console.error('Found', extractedFields);
    throw Error('extractCallback() should have returned an object');
  }
  const {
    frontText, backText, cardKind
  } = extractedFields;
  if (!__IS_PRODUCTION__) {
    console.log('--- FRONT TEXT ---');
    console.log(frontText);
    console.log();
    console.log('--- BACK TEXT ---');
    console.log(backText);
    console.log();
    console.log('--- CARD KIND ---');
    console.log(cardKind);
  }

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


const onHookClick = async (event, extractFieldsCallback, hookNode) => {
  event.stopImmediatePropagation();
  event.preventDefault();
  event.stopPropagation();
  let fields;
  try {
    fields = verifyExtractedFields(extractFieldsCallback());
    await updateButtonState(hookNode, 'loading');
    await ankiConnectAddNoteRequest(fields);
    await updateButtonState(hookNode, 'added');
    ankiAddNoteRequestOnSuccess(hookNode);
  } catch (error) {
    if (error.name === 'ScrapingError') {
      await updateButtonState(hookNode, 'error');
      onScrapingError(error);
    } else if (error.name === 'AnkiConnectError') {
      await updateButtonState(hookNode, 'error');
      ankiAddNoteRequestOnFail(error.message, fields.cardKind);
    } else if (error.name === 'CancelledError') {
      await updateButtonState(hookNode, 'available');
      return; // Cancelled by user.
    } else {
      await updateButtonState(hookNode, 'error');
      throw error;
    }
  }
};


const createHook = (extractFieldsCallback) => {
  if (!extractFieldsCallback || typeof extractFieldsCallback !== 'function') {
    throw Error('createHook() must be provided a extraction function');
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
  textNode.className = ANKI_HOOK_BUTTON_TEXT_CLASS;
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', siteSpecificFunctions.hookName);
  hookNode.className = ANKI_ADD_BUTTON_CLASS;
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);

  // Prevent the website to act on the hook.
  // This is necessary e.g. in Wordreference, which triggers a translation lookup upon a word click
  hookNode.addEventListener('mousedown', (event) => {event.stopImmediatePropagation();});
  hookNode.addEventListener('mouseup', (event) => {event.stopImmediatePropagation();});

  hookNode.onclick = event => onHookClick(event, extractFieldsCallback, hookNode);;
  return hookNode;
};


try {
  siteSpecificFunctions.run(createHook);
} catch (error) {
  if (error.name === 'ScrapingError') {
    onScrapingError(error);
  } else {
    throw error;
  }
}
