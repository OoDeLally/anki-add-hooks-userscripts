// ==UserScript==
// @namespace    https://github.com/OoDeLally
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// ==/UserScript==


PLACEHOLDER_FUNCTION_RUN
PLACEHOLDER_FUNCTION_EXTRACT_FRONT_TEXT
PLACEHOLDER_FUNCTION_EXTRACT_BACK_TEXT



const appendStyleSheet = () => {
  var style = document.createElement('style');
  style.appendChild(document.createTextNode(PLACEHOLDER_STYLE_TEXT));
  document.getElementsByTagName('head')[0].appendChild(style);
}


const ankiRequestOnFail = async (response, message) => {
  console.error('Anki request response:', response)
  console.error(message)
  if (message.includes('deck was not found')) {
    await GM.setValue('deckName', null);
  }
  if (message.includes('model was not found')) {
    await GM.setValue('modelName', null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
}


const ankiRequestOnSuccess = (hookNode) => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.text').innerText = 'Added';
  hookNode.onclick = () => {};
}

const hookOnClick = async (hookNode, frontText, backText) => {
  let deckName = await GM.getValue('deckName');
  if (!deckName) {
    deckName = prompt('Enter the name of the deck you want to add cards from this website', 'Default');
    if (!deckName) {
      return // Cancel
    }
    GM.setValue('deckName', deckName);
  }
  let modelName = await GM.getValue('modelName');
  if (!modelName) {
    modelName = prompt('Enter the name of the card model you want to create', 'Basic (and reversed card)');
    if (!modelName) {
      return // Cancel
    }
    await GM.setValue('modelName', modelName);
  }
  // console.log('hookOnClick')
  const dataStr = JSON.stringify({
    action: 'addNote',
    version: 6,
    params: {
      note: {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: frontText,
          Back: backText,
        },
        tags: [],
      }
    }
  });
  return GM.xmlHttpRequest({
    method: 'POST',
    url: 'http://localhost:8765',
    data: dataStr,
    onabort: response => {
      ankiRequestOnFail(response, 'Request was aborted');
    },
    onerror: response => {
      ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.')
    },
    onload: response => {
      const result = JSON.parse(response.responseText);
      if (result.error) {
        ankiRequestOnFail(response, result.error);
        return
      }
      ankiRequestOnSuccess(hookNode)
    }
  })
}


const createHook = (userdata) => {
  if (!extractFrontText || typeof extractFrontText != 'function') {
    throw Error('Second argument must be a function which extract text for the front side of the card');
  }
  if (!extractBackText || typeof extractBackText != 'function') {
    throw Error('Third argument must be a function which extract text for the back side of the card');
  }
  const starNodeBig = document.createElement('div');
  starNodeBig.innerText = '★';
  starNodeBig.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-small';
  const textNode = document.createElement('span');
  textNode.className = 'text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', PLACEHOLDER_HOOK_NAME);
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const frontText = extractFrontText(userdata);
    if (typeof frontText != 'string') {
      console.error('Found', frontText);
      throw Error('Provided extractFrontText() fonction did not return a string');
    }
    const backText = extractBackText(userdata);
    if (typeof frontText != 'string') {
      console.error('Found', backText);
      throw Error('Provided extractBackText() fonction did not return a string');
    }
    hookOnClick(hookNode, frontText, backText);
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
}


(function() {
  'use strict';
  appendStyleSheet();
  run();
})();
