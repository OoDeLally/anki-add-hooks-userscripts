// ==UserScript==
// @name         GoogleTranslate AnkiQuickAdder Hook
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on Google Translate
// @author       Pascal Heitz
// @include      /translate\.google\.com\//
// ==/UserScript==


function appendStyleSheep() {
  // TODO: Button style should be provided by the chrome extension
  const css = '.--anki-quick-adder-hook-- {'
            + '  width: 25px;'
            + '  height: 15px;'
            + '  box-sizing: content-box;'
            + '  position: relative;'
            + '  display: inline-block;'
            + '  vertical-align: middle;'
            + '  opacity: 0.4;'
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
            + '  float: right;'
            + '  top: 15px;'
            + '  right: 10px;'
            + '  cursor: pointer;'
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
            + '  top: -17px;'
            + '}'
            + '.--anki-quick-adder-hook-- .--anki-quick-adder-hook--star.--anki-quick-adder-hook--small {'
            + '  font-size: 25px;'
            + '  color: #0099ff;'
            + '  z-index: 1010;'
            + '  left: 0px;'
            + '  top: -8px;'
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
  // source language could be written as "ENGLISH - DETECTED" and we only want "ENGLISH"
  const sourceLanguage = document.querySelector('.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];
  const sourceSentence = document.querySelector('textarea#source').value;
  return `${sourceLanguage}\n${sourceSentence}`;
}



function extractBackText() {
  const targetLanguage = document.querySelector('.tl-sugg .jfk-button-checked').innerText;
  const translatedSentence = document.querySelector('.translation').innerText;
  return `${targetLanguage}\n${translatedSentence}`;
}



function createHook(frontText, backText) {
  const starNodeBig = document.createElement('div');
  starNodeBig.innerText = '★';
  starNodeBig.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--small';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', 'translate.google.com');
  hookNode.className = '--anki-quick-adder-hook--';
  hookNode.innerText = 'Add';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const hookNode = event.target;
    // console.log('extractFrontText():', extractFrontText())
    // console.log('extractBackText():', extractBackText())
    if (hookNode.dataset.clickHandler) {
      hookNode.dataset.clickHandler(extractFrontText(), extractBackText());
    } else {
      alert(
          'This button was not detected by AnkiQuickAdder.\n'
        + 'Make sure you have AnkiQuickAdder active at the last available version.\n'
        + 'If you did all those things, please post an issue at\n'
        + 'https://github.com/OoDeLally/ankiquickadder-hooks/issues'
      );
    }
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.prepend(starNodeBig);
  hookNode.prepend(starNodeSmall);
  return hookNode;
}




function run(){
  appendStyleSheep();

  setInterval(() => {
    const parentNode = document.querySelector('.result-footer');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.--anki-quick-adder-hook--');
    if (existingHook) {
      return // Hook already exists
    }
    const children = Array.from(parentNode.childNodes);
    const firstFloatLeftNode = children.find(node => node.style.float == 'left');
    parentNode.insertBefore(createHook(), firstFloatLeftNode);
  }, 500);
}


(function() {
  'use strict';
  run();
})();
