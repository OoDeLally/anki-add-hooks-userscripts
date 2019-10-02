// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Google Translate
// @version      2.1
// @description  Generate a hook for AnkiConnect on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//
// ==/UserScript==

(function () {
  'use strict';

  

  function __$styleInject ( css ) {
      if(!css) return ;

      if(typeof(window) == 'undefined') return ;
      let style = document.createElement('style');

      style.innerHTML = css;
      document.head.appendChild(style);
      return css;
  }

  __$styleInject(".-anki-add-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.8;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-add-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: green;\n  background-color: #cccccc;\n}\n.-anki-add-hook:hover {\n  opacity: 1;\n}\n\n.-anki-add-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-add-hook-added .-anki-add-hook-star-small {\n  color: green;\n}\n.-anki-add-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-add-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-add-hook-text {\n  text-decoration: none !important;\n  font-size: 12px !important;\n}\n\n\n.-anki-add-hook-loading .-anki-add-hook-star {\n  animation-name: spin;\n  animation-duration: 2000ms;\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n}\n\n@keyframes spin {\n    from {\n        transform:rotate(0deg);\n    }\n    to {\n        transform:rotate(360deg);\n    }\n}\n\n.-anki-add-hook-error {\n  border: 2px solid red;\n  opacity: 1;\n  color: red;\n  background-color: #cccccc;\n}\n.-anki-add-hook-error .-anki-add-hook-star-small {\n  color: red;\n}\n");

  __$styleInject(".banner {\n  height: 20px;\n  font-size: 14px;\n  color: deepskyblue;\n  text-align: left;\n}\n\n.banner-language {\n\n}\n\n\n.banner-hook-name {\n  float: right;\n}\n");

  // Highlight `elementsToHighlight` with `backgroundColor` when the user hovers the hook `hookNode`.
  var highlightOnHookHover = (hookNode, elementsToHighlight, backgroundColor) => {
    if (elementsToHighlight.forEach) {
      hookNode.onmouseover = () => {
        elementsToHighlight.forEach((elt) => {
          elt.style.background = backgroundColor;
        });
      };
      hookNode.onmouseout = () => {
        elementsToHighlight.forEach((elt) => {
          elt.style.background = null;
        });
      };
    } else {
      hookNode.onmouseover = () => {
        elementsToHighlight.style.background = backgroundColor;
      };
      hookNode.onmouseout = () => {
        elementsToHighlight.style.background = null;
      };
    }
  };

  var ScrapingError = (message) => {
    const error = Error(message);
    error.name = 'ScrapingError';
    error.location = window.location;
    error.stack = error.stack.split(/[\n\r]/gm).slice(4).join('\n');
    return error;
  };

  const ANKI_ADD_BUTTON_CLASS = '-anki-add-hook';
  const ANKI_ADD_BUTTON_CLASS_SELECTOR = `.${ANKI_ADD_BUTTON_CLASS}`;
  const ANKI_HOOK_BUTTON_LOADING_CLASS = '-anki-add-hook-loading';
  const ANKI_HOOK_BUTTON_ERROR_CLASS = '-anki-add-hook-error';
  const ANKI_HOOK_BUTTON_ADDED_CLASS = '-anki-add-hook-added';
  const ANKI_HOOK_BUTTON_TEXT_CLASS = '-anki-add-hook-text';
  const ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR = `.${ANKI_HOOK_BUTTON_TEXT_CLASS}`;

  const querySelectorAllInOneNode = (parentNode, selector, { throwOnUnfound = true } = {}) => {
    if (!parentNode || !parentNode.querySelectorAll) {
      throw Error(`parentNode does not seem to be a DOM node: ${parentNode}`);
    }
    if (typeof selector !== 'string') {
      throw Error('selector must be a string');
    }
    const foundNodes = Array.from(parentNode.querySelectorAll(selector));
    if (foundNodes.length === 0 && throwOnUnfound) {
      throw ScrapingError(`No node matches the selector '${selector}'`);
    }
    return foundNodes;
  };


  // Just like parentNode.querySelectorAll, but:
  // - can throw if not found.
  // - accepts parentNode as an array of nodes to look from.
  const querySelectorAll = (parentNode, selector, options = {}) => {
    if (typeof options !== 'object') {
      throw Error('If provided, `options`, must be an object');
    }
    if (Array.isArray(parentNode)) {
      let results = [];
      parentNode.forEach((node) => {
        const foundNodes = querySelectorAllInOneNode(node, selector, { throwOnUnfound: false });
        results = [...results, ...foundNodes];
      });
      if (results.length > 1 && options.throwOnFoundSeveral) {
        throw ScrapingError(`Several nodes match the selector '${selector}'`);
      }
      return results;
    } else {
      return querySelectorAllInOneNode(parentNode, selector, options);
    }
  };


  // Just like parentNode.querySelector, but:
  // - can throw if not found, or several found.
  // - accepts parentNode as an array of nodes to look from.
  const querySelector = (
    parentNode, selector, { throwOnUnfound = true, throwOnFoundSeveral = true } = {}
  ) => {
    let matchingNodes;
    try {
      matchingNodes = querySelectorAll(parentNode, selector, { throwOnUnfound });
    } catch (error) {
      if (error.name === 'ScrapingError') {
        throw ScrapingError(error.message); // Remove the extra stackframe
      } else {
        throw error;
      }
    }
    if (matchingNodes.length > 1 && throwOnFoundSeveral) {
      throw ScrapingError(`Several nodes match the selector '${selector}'`);
    }
    return matchingNodes[0];
  };


  // Tells if `parentNode` already contains an anki hook.
  // `parentNode` can be an array of nodes to look from.
  const doesAnkiHookExistIn = parentNode =>
    !!querySelector(
      parentNode,
      ANKI_ADD_BUTTON_CLASS_SELECTOR,
      { throwOnUnfound: false }
    );

  const getSourceLanguage = () =>
    querySelector(document, '.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];

  const getTargetLanguage = () =>
    querySelector(document, '.tl-sugg .jfk-button-checked').innerText;

  const frontFieldSelector = 'textarea#source';
  const backFieldSelector = '.translation';


  var runOnMainPanel = (createHook) => {
    const containerBlock = querySelector(document, '.source-target-row');
    const parentNode = querySelector(containerBlock, '.result-footer', { throwOnUnfound: false });
    if (!parentNode) {
      return;
    }
    if (doesAnkiHookExistIn(parentNode)) {
      return;
    }
    const children = Array.from(parentNode.childNodes);
    const firstFloatLeftNode = children.find(node => node.style.float === 'left');
    const hook = createHook(() => {
      const sourceLanguage = getSourceLanguage();
      const targetLanguage = getTargetLanguage();
      return {
        frontText: querySelector(document, frontFieldSelector).value,
        backText: querySelector(document, backFieldSelector).innerText,
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    });
    hook.style.float = 'right';
    hook.style.top = '15px';
    hook.style.right = '10px';
    const frontAndBackFields = querySelectorAll(containerBlock, `${frontFieldSelector},${backFieldSelector}`);
    highlightOnHookHover(hook, frontAndBackFields, '#d2e3fc');
    parentNode.insertBefore(hook, firstFloatLeftNode);
  };

  const tryAddingToRow = (parentTr, createHook) => {
    const [, , actionTd] = querySelectorAll(parentTr, 'td');
    if (doesAnkiHookExistIn(actionTd)) {
      return;
    }
    const hook = createHook(() => {
      // The secondary panel proposes reverse translations
      const targetLanguage = getSourceLanguage();
      const sourceLanguage = getTargetLanguage();
      const [sourceTd, targetTd] = querySelectorAll(parentTr, 'td');
      return {
        frontText: sourceTd.innerText,
        backText: targetTd.innerText,
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    });
    hook.style.display = 'inline-block';
    hook.style.marginLeft = '5px';
    highlightOnHookHover(hook, parentTr, '#d2e3fc');
    querySelector(actionTd, '.gt-baf-cell').append(hook);
  };


  var runOnSecondaryPanel = (createHook) => {
    querySelectorAll(document, '.gt-baf-table tr.gt-baf-entry', { throwOnUnfound: false })
      .forEach(tr => tryAddingToRow(tr, createHook, getSourceLanguage, getTargetLanguage));
  };

  // @name         Anki Add Hooks for Google Translate


  const hookName = 'translate.google.com';


  const run = (createHook) => {
    setInterval(() => {
      runOnMainPanel(createHook);
      runOnSecondaryPanel(createHook);
    }, 500);
  };

  var onScrapingError = (error) => {
    const productionExtraMessage = `
    Please report the following infos at:
    https://github.com/OoDeLally/anki-add-hooks-userscripts/issues`;
    console.error(
      `AnkiAddHooks: Error during web page scraping. ${
      productionExtraMessage
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: 2.1.1.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 2.1.

     Stack: ${error.stack}
    `
    );
    {
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


  const buildCardFace = (htmlContent, language, hookName$$1) => {
    const bannerContent = [
      '<style>.banner{height:20px;font-size:14px;color:deepskyblue;text-align:left;}.banner-language{}.banner-hook-name{float:right;}</style>', // Replaced at compilation by ./card_style.css
      `<div class="banner-hook-name">${hookName$$1}</div>`,
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
          allowDuplicate: true,
        },
        fields: {
          [modelFields[0]]: buildCardFace(
            fields.frontText,
            fields.frontLanguage,
            hookName
          ),
          [modelFields[1]]: buildCardFace(
            fields.backText,
            fields.backLanguage,
            hookName
          ),
        },
        tags: [hookName],
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
    hookNode.setAttribute('name', hookName);
    hookNode.className = ANKI_ADD_BUTTON_CLASS;
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    hookNode.onclick = event => onHookClick(event, extractFieldsCallback, hookNode);
    return hookNode;
  };


  try {
    run(createHook);
  } catch (error) {
    if (error.name === 'ScrapingError') {
      onScrapingError(error);
    } else {
      throw error;
    }
  }

}());
