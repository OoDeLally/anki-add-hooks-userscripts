// ==UserScript==
// @name         WordReference AnkiQuickAdder Hook
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on WordReference
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com/[a-z]{4}/.+
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


function createHook(frontText, backText, trGroup) {
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
  hookNode.onmouseover = () => {
    trGroup.forEach(tr => { tr.style.backgroundColor = 'gold' });
  };
  hookNode.onmouseout = () => {
    trGroup.forEach(tr => { tr.style.backgroundColor = null });
  };
  hookNode.prepend(starNodeBig);
  hookNode.prepend(starNodeSmall);
  return hookNode;
}


function getTrGroups(tableNode) {
  const trGroups = [];
  let currentTrGroup = [];
  let currentTrClass = 'even';
  // console.log('tableNode.querySelectorAll():', tableNode.querySelectorAll('.even, .odd'))
  Array.from(tableNode.querySelectorAll('.even, .odd'))
  // .sort((a, b) => a.rowIndex - b.rowIndex)
  .forEach(trNode => {
    if (trNode.className == currentTrClass) {
      currentTrGroup.push(trNode);
    } else {
      trGroups.push(currentTrGroup);
      currentTrGroup = [trNode];
      currentTrClass = currentTrClass == 'even' ? 'odd' : 'even';
    }
  });
  trGroups.push(currentTrGroup);
  return trGroups;
}


function addHooksInTrGroup(trGroup) {
  const cardFrontFaceText = trGroup[0].querySelector('td:first-child').innerText;
  const cardBackFaceText = trGroup.map(trNode => trNode.querySelector('td:last-child').innerText).join('\n');
  const hook = createHook(cardFrontFaceText, cardBackFaceText, trGroup);
  const parent = trGroup[0].querySelector('td');
  parent.style.position = 'relative';
  parent.prepend(hook);
}


function addHooksInTable(tableNode){
  getTrGroups(tableNode).forEach(addHooksInTrGroup);
}


function getTables() {
  return document.querySelectorAll('.WRD');
}


function run(){
  appendStyleSheep();
  getTables().forEach(addHooksInTable);
}


(function() {
  'use strict';
  run();
})();
