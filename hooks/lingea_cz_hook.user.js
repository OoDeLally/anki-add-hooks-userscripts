// ==UserScript==
// @name         Lingea.cz AnkiQuickAdder Hook
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
// @connect      localhost
// @grant        GM_xmlhttpRequest
// @require        https://code.jquery.com/jquery-2.0.3.min.js
// ==/UserScript==


function appendStyleSheep() {
  // TODO: Button style should be provided by the chrome extension
  const css = '.--anki-quick-adder-hook-- {'
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
            + '}'
            + '.--anki-quick-adder-hook--.added {'
            + '  border: 2px solid green;'
            + '  opacity: 1;'
            + '  cursor: auto;'
            + '  color: #ccff99;'
            + '}'
            + '.--anki-quick-adder-hook--:hover {'
            + '  opacity: 1;'
            + '}'
            + '.--anki-quick-adder-hook-- .--anki-quick-adder-hook--star {'
            + '  display: block;'
            + '  transform: rotate(-15deg);'
            + '  position: absolute;'
            + '}'
            + '.--anki-quick-adder-hook-- .--anki-quick-adder-hook--star.--anki-quick-adder-hook--big {'
            + '  font-size: 40px;'
            + '  color: white;'
            + '  z-index: 1005;'
            + '  left: -7px;'
            + '  top: -1px;'
            + '}'
            + '.--anki-quick-adder-hook-- .--anki-quick-adder-hook--star.--anki-quick-adder-hook--small {'
            + '  font-size: 25px;'
            + '  color: #0099ff;'
            + '  z-index: 1010;'
            + '  left: 0px;'
            + '  top: -1px;'
            + '}';
  var style = document.createElement('style');
  if (style.styleSheet) {
      style.styleSheet.cssText = css;
  } else {
      style.appendChild(document.createTextNode(css));
  }
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
  alert(`AnkiConnect returned an error:\n${message}`);
}

function ankiRequestOnSuccess(hookNode) {
  hookNode.classList.add('added');
  hookNode.querySelector('.text').innerText = 'Added';
  hookNode.onclick = () => {};
}


function hookOnClick(hookNode, frontText, backText) {
  // console.log('hookOnClick')
  const dataStr = JSON.stringify({
    action: 'addNote',
    version: 6,
    params: {
      note: {
        deckName: 'cestina',
        modelName: 'Basic (and reversed card)',
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
  starNodeBig.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--small';
  const textNode = document.createElement('span');
  textNode.className = 'text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', 'slovniky.lingea.cz');
  hookNode.className = '--anki-quick-adder-hook--';
  hookNode.title = 'Create an Anki card from this translation';
  // hookNode.onclick = () => {
  //   alert(
  //       'This button was not detected by AnkiQuickAdder.\n'
  //     + 'Make sure you have AnkiQuickAdder active at the last available version.\n'
  //     + 'If you did all those things, please post an issue at\n'
  //     + 'https://github.com/OoDeLally/ankiquickadder-hooks/issues'
  //   );
  //   event.preventDefault();
  //   event.stopPropagation();
  // };
  hookNode.onclick = (event) => {
    hookOnClick(hookNode, extractFrontText(), extractBackText());
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.append(starNodeBig);
  hookNode.append(starNodeSmall);
  hookNode.append(textNode);
  return hookNode;
}




function run(){
  appendStyleSheep();

  setInterval(() => {
    const parentNode = document.querySelector('.entry tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.--anki-quick-adder-hook--');
    if (existingHook) {
      return // Hook already exists
    }
    parentNode.append(createHook());
  }, 500);
}


(function() {
  'use strict';
  run();
})();
