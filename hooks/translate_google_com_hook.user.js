// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Google Translate
// @version      1.0
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

  // Just like parentNode.querySelectorAll, but throws if not found
  const querySelectorAll = (parentNode, selector, { throwOnUnfound = true } = {}) => {
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


  // Just like parentNode.querySelector, but throws if not found, or several found
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


  const doesAnkiHookExistIn = parentNode =>
    querySelector(
      parentNode,
      ANKI_ADD_BUTTON_CLASS_SELECTOR,
      { throwOnUnfound: false }
    );

  const frontFieldSelector = 'textarea#source';
  const backFieldSelector = '.translation';


  const extract = () => ({
    frontText: querySelector(document, frontFieldSelector).value,
    backText: querySelector(document, backFieldSelector).innerText,
  });


  const run = (createHook) => {
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
    const hook = createHook({ type: 'mainPanel' });
    hook.style.float = 'right';
    hook.style.top = '15px';
    hook.style.right = '10px';
    const frontAndBackFields = querySelectorAll(containerBlock, `${frontFieldSelector},${backFieldSelector}`);
    highlightOnHookHover(hook, frontAndBackFields, '#d2e3fc');
    parentNode.insertBefore(hook, firstFloatLeftNode);
  };

  const extract$1 = (parentTr) => {
    const [sourceTd, targetTd] = querySelectorAll(parentTr, 'td');
    return {
      frontText: sourceTd.innerText,
      backText: targetTd.innerText,
    };
  };


  const tryAddingToRow = (parentTr, createHook) => {
    const [, , actionTd] = querySelectorAll(parentTr, 'td');
    if (doesAnkiHookExistIn(actionTd)) {
      return;
    }
    const hook = createHook({ type: 'secondaryPanel', parentNode: parentTr });
    hook.style.display = 'inline-block';
    hook.style.marginLeft = '5px';
    highlightOnHookHover(hook, parentTr, '#d2e3fc');
    querySelector(actionTd, '.gt-baf-cell').append(hook);
  };


  const run$1 = (createHook) => {
    querySelectorAll(document, '.gt-baf-table tr.gt-baf-entry')
      .forEach(tr => tryAddingToRow(tr, createHook));
  };

  // @name         Anki Add Hooks for Google Translate


  const hookName = 'translate.google.com';


  const extract$2 = ({ type, parentNode }) => {
    const sourceLanguage = querySelector(document, '.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];
    const targetLanguage = querySelector(document, '.tl-sugg .jfk-button-checked').innerText;
    if (type === 'mainPanel') {
      return {
        ...extract(),
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    }
    if (type === 'secondaryPanel') {
      return {
        ...extract$1(parentNode),
        frontLanguage: targetLanguage,
        backLanguage: sourceLanguage,
        cardKind: `${targetLanguage} -> ${sourceLanguage}`,
      };
    }
    throw Error(`Unknown type ${type}`);
  };


  const run$2 = (createHook) => {
    setInterval(() => {
      run(createHook);
      run$1(createHook);
    }, 500);
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


  const handleScrapingError = (error) => {
    const productionExtraMessage = `
    Please report the following infos at:
    https://github.com/OoDeLally/anki-add-hooks-userscripts/issues`;
    console.error(
      `AnkiAddHooks: Error during web page scraping. ${
      productionExtraMessage
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: 1.0.0.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 1.0.

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


  // Extract the data from the web page
  const extractPageFields = (userdata) => {
    const extractedFields = extract$2(userdata);
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


  const ankiRequestOnFail = async (message, cardKind) => {
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(cardKind), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(cardKind), null);
    }
    alert(message);
  };


  const ankiRequestOnSuccess = (hookNode) => {
    hookNode.onclick = () => {};
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
            reject(AnkiCardAddingError('Request was aborted'));
          },
          onerror: (response) => {
            console.error(response);
            reject(AnkiCardAddingError(
              `Could not connect to Anki Desktop. Please make sure that:
    - Anki Desktop is running.
    - AnkiConnect add-on is installed on Anki Desktop.
    - Anki Desktop was restarted after installing AnkiConnect add-on.`
            ));
          },
          onload: (response) => {
            const result = JSON.parse(response.responseText);
            if (result.error) {
              reject(AnkiCardAddingError(result.error));
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
            hookName
          ),
          Back: buildCardFace(
            fields.backText,
            fields.backLanguage,
            hookName
          ),
        },
        tags: [hookName],
      },
    });

  const updateButtonState = (hook, state) => {
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
  };


  const wait = async ms => new Promise(resolve => setTimeout(resolve, ms));


  const onHookClick = async (event, userdata, hookNode) => {
    event.preventDefault();
    event.stopPropagation();
    let fields;
    try {
      fields = extractPageFields(userdata);
      updateButtonState(hookNode, 'loading');
      await ankiConnectAddRequest(fields);
      updateButtonState(hookNode, 'added');
      ankiRequestOnSuccess(hookNode);
    } catch (error) {
      updateButtonState(hookNode, 'error');
      await wait(100); // Leave time for the button style to be updated
      if (error.name === 'ScrapingError') {
        handleScrapingError(error);
      } else if (error.name === 'AnkiCardAddingError') {
        ankiRequestOnFail(error.message, fields.cardKind);
      } else {
        throw error;
      }
    }
  };


  const createHook = (userdata) => {
    if (!extract$2 || typeof extract$2 !== 'function') {
      throw Error('Missing function extract()');
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
    hookNode.setAttribute('name', hookName);
    hookNode.className = ANKI_ADD_BUTTON_CLASS;
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    hookNode.onclick = event => onHookClick(event, userdata, hookNode);
    return hookNode;
  };


  try {
    run$2(createHook);
  } catch (error) {
    if (error.name === 'ScrapingError') {
      handleScrapingError(error);
    } else {
      throw error;
    }
  }

}());
