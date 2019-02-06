// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for WordReference.com
// @version      0.1
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/
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

  // @name         Anki Add Hooks for WordReference.com


  const getTrGroups = (tableNode) => {
    const trGroups = [];
    let currentTrGroup = [];
    let currentTrClass = 'even';
    // console.log('tableNode.querySelectorAll():', tableNode.querySelectorAll('.even, .odd'))
    Array.from(tableNode.querySelectorAll('.even, .odd'))
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .forEach((trNode) => {
        if (trNode.className === currentTrClass) {
          currentTrGroup.push(trNode);
        } else {
          trGroups.push(currentTrGroup);
          currentTrGroup = [trNode];
          currentTrClass = currentTrClass === 'even' ? 'odd' : 'even';
        }
      });
    trGroups.push(currentTrGroup);
    return trGroups;
  };

  const hookName = 'wordreference.com';


  const addHooksInTrGroup = (trGroup, createHook) => {
    const parent = trGroup[0].querySelector('td');
    parent.style.position = 'relative';
    const hook = createHook(trGroup);
    hook.style.position = 'absolute';
    hook.style.left = '-80px';
    parent.prepend(hook);
  };


  const addHooksInTable = (tableNode, createHook) => {
    getTrGroups(tableNode).forEach(trGroup => addHooksInTrGroup(trGroup, createHook));
  };


  const getTables = () => document.querySelectorAll('.WRD');


  const run = (createHook) => {
    getTables().forEach(tableNode => addHooksInTable(tableNode, createHook));
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
    if (!undefined || typeof undefined !== 'function') {
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
      const extractedFields = undefined(userdata);
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


  run(createHook);

}());
