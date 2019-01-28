// ==UserScript==
// Customize this metadata
// @name         AnkiConnect Hook for lingea.cz
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/


// Dont touch this metadata
// @require      https://raw.githubusercontent.com/OoDeLally/tampermonkey-anki-add-hooks/develop/common.user.js
// @grant        GM.getResourceText
// @grant        GM.xmlhttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @resource     styleSheet https://raw.githubusercontent.com/OoDeLally/tampermonkey-anki-add-hooks/develop/hook-style.css
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
  console.log('AnkiAddHooks:', AnkiAddHooks)
  AnkiAddHooks.init(GM);

  setInterval(() => {
    const parentNode = document.querySelector('.entry tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return // Hook already exists
    }
    const hook = AnkiAddHooks.createHook('slovniky.lingea.cz', extractFrontText, extractBackText);
    parentNode.appendChild(hook);
  }, 500);
}

(function() {
  'use strict';
  run();
})();
