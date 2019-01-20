// ==UserScript==
// @name         FIXME AnkiQuickAdder Hook
// @namespace    FIXME
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on FIXME
// @author       FIXME
// @include      FIXME
// @grant        none
// ==/UserScript==


function appendStyleSheep() {
  const css = '.--anki-quick-adder-hook-- {'
            + '  display: block;'
            + '  opacity: 0.4;'
            + '  overflow: hidden;'
            + '  position: absolute;'
            + '  z-index: 1000;'
            + '  border-radius: 5px;'
            + '  padding-left: 30px;'
            + '  padding-right: 5px;'
            + '  color: white;'
            + '  font-size: 12px;'
            + '  font-weight: bold;'
            + '  background-color: #aaaaaa;'
            + '  border: 2px solid #222222;'
            + '  left: -70px;'
            + '}'
            + '.--anki-quick-adder-hook--:hover {'
            + '  opacity: 1;'
            + '}'
            + '.--anki-quick-adder-hook-- .--anki-quick-adder-hook--star {'
            + '  display: inline-block;'
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


function createHook(frontText, backText) {
  const starNodeBig = document.createElement('div');
  starNodeBig.innerText = '★';
  starNodeBig.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--big';
  const starNodeSmall = document.createElement('div');
  starNodeSmall.innerText = '★';
  starNodeSmall.className = '--anki-quick-adder-hook--star --anki-quick-adder-hook--small';
  const hookNode = document.createElement('div');
  hookNode.className = '--anki-quick-adder-hook--';
  hookNode.setAttribute('front', frontText);
  hookNode.setAttribute('back', backText);
  hookNode.innerText = 'Add';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const hookNode = event.target;
    if (hookNode.dataset.clickHandler) {
      hookNode.dataset.clickHandler(hookNode.attributes.front, hookNode.attributes.back);
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

  // FIXME
  const hook = createHook('front face text', 'back face text');
  document.querySelector('hook-parent-selector').append(hook);
  // !FIXME
}


(function() {
  'use strict';
  run();
})();
