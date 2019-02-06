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

  __$styleInject(".-anki-quick-adder-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-added .-anki-quick-adder-hook-star-small {\n  color: green;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-quick-adder-hook-text {\n\n}\n");

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

  const frontFieldSelector = 'textarea#source';
  const backFieldSelector = '.translation';


  const extract = () => {
    const frontText = document.querySelector(frontFieldSelector).value;
    const backText = document.querySelector(backFieldSelector).innerText;
    return {
      frontText: `<div style="text-align:center;">${frontText}</div>`,
      backText: `<div style="text-align:center;">${backText}</div>`,
    };
  };


  const run = (createHook) => {
    const containerBlock = document.querySelector('.source-target-row');
    const parentNode = containerBlock.querySelector('.result-footer');
    if (!parentNode) {
      return; // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
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
      frontText: `<div style="text-align:center;">${sourceTd.innerText}</div>`,
      backText: `<div style="text-align:center;">${targetTd.innerText}</div>`,
    };
  };


  const tryAddingToRow = (parentTr, createHook) => {
    const [, , actionTd] = parentTr.querySelectorAll('td');
    const existingHook = actionTd.querySelector('.-anki-quick-adder-hook');
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

  /* global GM */


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


  const buildCardFace = (text, language, hookName$$1) => {
    const bannerContent = [
      '<style>.banner{height:20px;font-size:14px;color:deepskyblue;text-align:left;}.banner-language{}.banner-hook-name{float:right;}</style>', // Replaced at compilation by ./card_style.css
      `<div class="banner-hook-name">${hookName$$1}</div>`,
    ];
    if (language) {
      bannerContent.push(`<div class="banner-language">${language}</div>`);
    }
    return `<div class="banner">${bannerContent.join('')}</div>${text}`;
  };


  const hookOnClick = async (
    hookNode, frontText, backText, frontLanguage, backLanguage, cardKind, hookName$$1
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
            Front: buildCardFace(frontText, frontLanguage, hookName$$1),
            Back: buildCardFace(backText, backLanguage, hookName$$1),
          },
          tags: [hookName],
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
    if (!extract$2 || typeof extract$2 !== 'function') {
      throw Error('Missing function extract()');
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
    hookNode.setAttribute('name', hookName);
    hookNode.className = '-anki-quick-adder-hook';
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.onclick = (event) => {
      const extractedFields = extract$2(userdata);
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




      hookOnClick(hookNode, frontText, backText, frontLanguage, backLanguage, cardKind, hookName);
      event.preventDefault();
      event.stopPropagation();
    };
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    return hookNode;
  };


  run$2(createHook);

}());
