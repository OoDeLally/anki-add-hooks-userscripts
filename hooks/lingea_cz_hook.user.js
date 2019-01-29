// ==UserScript==
// @name         Anki Add Hooks for lingea.cz
// @namespace    https://github.com/OoDeLally
// @version      0.3
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// ==/UserScript==



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



function run(){
  init(GM);

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

const hookName = 'Anki Add Hooks for lingea.cz';




const styleText = '.-anki-quick-adder-hook {'
+ '  width: 35px;'
+ '  height: 15px;'
+ '  box-sizing: content-box;'
+ '  position: relative;'
+ '  display: inline-block;'
+ '  vertical-align: middle;'
+ '  opacity: 0.6;'
+ '  overflow: hidden;'
+ '  z-index: 1000;'
+ '  border-radius: 5px;'
+ '  padding-left: 30px;'
+ '  padding-right: 5px;'
+ '  color: white;'
+ '  font-size: 12px;'
+ '  font-weight: bold;'
+ '  background-color: #aaaaaa;'
+ '  border: 2px solid #222222;'
+ '  line-height: 17px;'
+ '  top: 0px;'
+ '  right: 0px;'
+ '  cursor: pointer;'
+ '  user-select: none;'
+ '  -webkit-user-select: none;'
+ '  -ms-user-select: none;'
+ '  -webkit-touch-callout: none;'
+ '  -o-user-select: none;'
+ '  -moz-user-select: none;'
+ '}'
+ '.-anki-quick-adder-hook-added {'
+ '  border: 2px solid green;'
+ '  opacity: 1;'
+ '  cursor: auto;'
+ '  color: #ccff99;'
+ '}'
+ '.-anki-quick-adder-hook:hover {'
+ '  opacity: 1;'
+ '}'
+ '.-anki-quick-adder-hook-star {'
+ '  display: block;'
+ '  transform: rotate(-15deg);'
+ '  position: absolute;'
+ '}'
+ '.-anki-quick-adder-hook-star-big {'
+ '  font-size: 40px;'
+ '  color: white;'
+ '  z-index: 1005;'
+ '  left: -7px;'
+ '  top: -1px;'
+ '}'
+ '.-anki-quick-adder-hook-star-small {'
+ '  font-size: 25px;'
+ '  color: #0099ff;'
+ '  z-index: 1010;'
+ '  left: 0px;'
+ '  top: -1px;'
+ '}';


var initialized = false;


const appendStyleSheet = async () => {
  var style = document.createElement('style');
  style.appendChild(document.createTextNode(styleText));
  document.getElementsByTagName('head')[0].appendChild(style);
}


const init = () => {
  appendStyleSheet();
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


const createHook = () => {
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
  hookNode.setAttribute('name', hookName);
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const frontText = extractFrontText();
    if (typeof frontText != 'string') {
      console.error('Found', frontText);
      throw Error('Provided extractFrontText() fonction did not return a string');
    }
    const backText = extractBackText();
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
  run();
})();
