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
// @resource     styleSheet https://raw.githubusercontent.com/OoDeLally/ankiquickadder-hooks/develop/common.js
// @resource     styleSheet https://raw.githubusercontent.com/OoDeLally/ankiquickadder-hooks/develop/hook-style.css
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
  AnkiAddHooks.init();

  setInterval(() => {
    const parentNode = document.querySelector('.entry tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return // Hook already exists
    }
    parentNode.appendChild(AnkiAddHooks.createHook('slovniky.lingea.cz'));
  }, 500);
}

(function() {
  'use strict';
  run();
})();
