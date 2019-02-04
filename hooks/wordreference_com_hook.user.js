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

  // @name         Anki Add Hooks for WordReference.com
  // @version      0.1
  // @description  Generate a hook for AnkiConnect on WordReference.com
  // @author       Pascal Heitz
  // @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/


  const getLanguageCodes = () => {
    const match = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})\//);
    return [match[1], match[2]];
  };


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

  const extractFrontText = (trGroup) => {
    const firstRowTds = trGroup[0].querySelectorAll('td');
    const firstCell = firstRowTds[0];
    const firstCellStrong = firstCell.querySelector('strong');
    if (!firstCellStrong) {
      return null; // Not a real definition row
    }
    const firstCellStrongChildren = Array.from(firstCellStrong.childNodes).filter(node => node.nodeName !== 'A');
    const firstChildText = firstCellStrongChildren.map(node => node.textContent).join('');
    const remainingChildrenTexts = Array.from(firstCell.childNodes)
      .slice(1)
      .map(node => node.innerText)
      .filter(text => text)
      .map(text => text.trim())
      .filter(text => text);
    let frontText = `${getLanguageCodes()[0].toUpperCase()}\n${firstChildText}`;
    if (remainingChildrenTexts.length > 0) {
      frontText += ` [${remainingChildrenTexts.join(' ')}]`;
    }
    const secondCellText = Array.from(firstRowTds[1].childNodes)
      .filter(node => !node.className || !node.className.includes('dsense'))
      .map(node => node.textContent)
      .join('');
    if (secondCellText) {
      frontText += ` (${secondCellText.trim()})`;
    }
    return frontText;
  };


  const extractBackText = (trGroup) => {
    const languageCode = getLanguageCodes()[1].toUpperCase();
    const text = trGroup
      .filter(tr => !(parseInt(tr.querySelector('td:last-child').getAttribute('colspan'), 10) > 1))
      .map((tr) => {
        const tds = tr.querySelectorAll('td');
        const lastTd = tds[2];
        const lastTdChildren = Array.from(lastTd.childNodes);
        let backText = lastTdChildren[0].textContent;
        const firstTdOtherChildren = lastTdChildren.slice(1);
        if (firstTdOtherChildren.length > 0) {
          backText += `[${firstTdOtherChildren.map(node => node.innerText)}]`;
        }
        const middleTdText = Array.from(tds[1].childNodes)
          .filter(node => node.className && node.className.includes('dsense'))
          .map(node => node.textContent)
          .join('');
        if (middleTdText) {
          backText += ` ${middleTdText}`;
        }
        return backText;
      })
      .join('\n');
    return `${languageCode}\n${text}`;
  };


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

  const extractDirection = () => {
    const languageCodes = getLanguageCodes();
    return `${languageCodes[0]} -> ${languageCodes[1]}`;
  };


  const run = (createHook) => {
    getTables().forEach(tableNode => addHooksInTable(tableNode, createHook));
  };

  /* global GM */


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
          fields: {
            Front: frontText,
            Back: backText,
          },
          tags: [hookName],
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
    if (!extractFrontText || typeof extractFrontText !== 'function') {
      throw Error('Missing function extractFrontText()');
    }
    if (!extractBackText || typeof extractBackText !== 'function') {
      throw Error('Missing function extractBackText()');
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
      const frontText = extractFrontText(userdata);
      if (typeof frontText !== 'string') {
        console.error('Found', frontText);
        throw Error('Provided siteSpecificFunctions.extractFrontText() fonction did not return a string');
      }
      const backText = extractBackText(userdata);
      if (typeof frontText !== 'string') {
        console.error('Found', backText);
        throw Error('Provided siteSpecificFunctions.extractBackText() fonction did not return a string');
      }
      const directionCode = extractDirection(userdata);
      if (typeof frontText !== 'string') {
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


  run(createHook);

}());
