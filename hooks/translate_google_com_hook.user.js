// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Google Translate
// @version      0.1
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

  __$styleInject(".-anki-add-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-add-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-add-hook:hover {\n  opacity: 1;\n}\n.-anki-add-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-add-hook-added .-anki-add-hook-star-small {\n  color: green;\n}\n.-anki-add-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-add-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-add-hook-text {\n\n}\n");

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

  const ANKI_ADD_BUTTON_CLASS = '-anki-add-hook';
  const ANKI_ADD_BUTTON_CLASS_SELECTOR = `.${ANKI_ADD_BUTTON_CLASS}`;

  const frontFieldSelector = 'textarea#source';
  const backFieldSelector = '.translation';


  const extract = () => ({
    frontText: document.querySelector(frontFieldSelector).value,
    backText: document.querySelector(backFieldSelector).innerText,
  });


  const run = (createHook) => {
    const containerBlock = document.querySelector('.source-target-row');
    const parentNode = containerBlock.querySelector('.result-footer');
    if (!parentNode) {
      return; // Container not found
    }
    const existingHook = parentNode.querySelector(ANKI_ADD_BUTTON_CLASS_SELECTOR);
    if (existingHook) {
      return; // Hook already exists
    }
    const children = Array.from(parentNode.childNodes);
    const firstFloatLeftNode = children.find(node => node.style.float === 'left');
    const hook = createHook({ type: 'mainPanel' });
    hook.style.float = 'right';
    hook.style.top = '15px';
    hook.style.right = '10px';
    highlightOnHookHover(hook, containerBlock.querySelectorAll(`${frontFieldSelector},${backFieldSelector}`), '#d2e3fc');
    parentNode.insertBefore(hook, firstFloatLeftNode);
  };

  const extract$1 = (parentTr) => {
    const [sourceTd, targetTd] = parentTr.querySelectorAll('td');
    return {
      frontText: sourceTd.innerText,
      backText: targetTd.innerText,
    };
  };


  const tryAddingToRow = (parentTr, createHook) => {
    const [, , actionTd] = parentTr.querySelectorAll('td');
    const existingHook = actionTd.querySelector(ANKI_ADD_BUTTON_CLASS_SELECTOR);
    if (existingHook) {
      return; // Hook already exists
    }
    const hook = createHook({ type: 'secondaryPanel', parentNode: parentTr });
    hook.style.display = 'inline-block';
    hook.style.marginLeft = '5px';
    highlightOnHookHover(hook, parentTr, '#d2e3fc');
    actionTd.querySelector('.gt-baf-cell').append(hook);
  };


  const run$1 = (createHook) => {
    document.querySelectorAll('.gt-baf-table tr.gt-baf-entry')
      .forEach(tr => tryAddingToRow(tr, createHook));
  };

  // @name         Anki Add Hooks for Google Translate


  const hookName = 'translate.google.com';


  const extract$2 = ({ type, parentNode }) => {
    const sourceLanguage = document.querySelector('.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];
    const targetLanguage = document.querySelector('.tl-sugg .jfk-button-checked').innerText;
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


  const handleScrappingError = (error) => {
    const productionExtraMessage = `
    Please report the following infos at:
    https://github.com/OoDeLally/anki-add-hooks-userscripts/issues`;
    console.error(
      `AnkiAddHooks: Error during web page scrapping. ${
      productionExtraMessage
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: 1.0.0.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 0.1.

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
    if (error.name === 'ScrappingError') {
      handleScrappingError(error);
    } else {
      throw error;
    }
  }

}());
