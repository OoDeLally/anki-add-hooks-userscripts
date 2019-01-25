// ==UserScript==
// @name         Lingea.cz AnkiQuickAdder Hook
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
// @connect      localhost
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @resource     styleSheet https://raw.githubusercontent.com/OoDeLally/ankiquickadder-hooks/master/hook-style.css
// ==/UserScript==


function appendStyleSheep() {
  var style = document.createElement('style');
  const css = GM_getResourceText('styleSheet');
  style.appendChild(document.createTextNode(css));
  document.getElementsByTagName('head')[0].appendChild(style);
}

function extractFrontText() {
  const sourceSentence = document.querySelector('h1').innerText;
  return sourceSentence;
}

function extractBackText() {
  const translationRows = Array.from(document.querySelectorAll('.entry tr'))
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const definitionText = translationRows.map(tr => tr.innerText).join('\n');
  return definitionText;
}

function ankiRequestOnFail(response, message) {
  console.error('Anki request response:', response)
  console.error(message)
  if (message.includes('deck was not found')) {
    GM_setValue('deckName', null);
  }
  if (message.includes('model was not found')) {
    GM_setValue('modelName', null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
}

function ankiRequestOnSuccess(hookNode) {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.text').innerText = 'Added';
  hookNode.onclick = () => {};
}


function hookOnClick(hookNode, frontText, backText) {
  let deckName = GM_getValue('deckName');
  if (!deckName) {
    deckName = prompt('Enter the name of the deck you want to add cards from this website', 'Default');
    if (!deckName) {
      return // Cancel
    }
  }
  let modelName = GM_getValue('modelName');
  if (!modelName) {
    modelName = prompt('Enter the name of the card model you want to create', 'Basic (and reversed card)');
    if (!modelName) {
      return // Cancel
    }
  }
  GM_setValue('deckName', deckName);
  GM_setValue('modelName', modelName);
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
  return GM_xmlhttpRequest({
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

function createHook() {
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
  hookNode.setAttribute('name', 'slovniky.lingea.cz');
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    hookOnClick(hookNode, extractFrontText(), extractBackText());
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
}

function run(){
  appendStyleSheep();

  setInterval(() => {
    const parentNode = document.querySelector('.entry tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return // Hook already exists
    }
    parentNode.appendChild(createHook());
  }, 500);
}

(function() {
  'use strict';
  run();
})();
