// ==UserScript==
// @name         WordReference AnkiQuickAdder Hook
// @namespace    https://github.com/OoDeLally
// @version      0.1
// @description  Generate a hook for AnkiQuickAdder on WordReference
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/
// @grant        none
// ==/UserScript==

function getLanguageCodes() {
  const match = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})\//);
  return [match[1], match[2]];
}


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
  console.log('frontText:', frontText)
  console.log('backText:', backText)
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


function extractFrontText(trGroup) {
  const firstRowTds = trGroup[0].querySelectorAll('td');
  const firstCell = firstRowTds[0];
  const firstCellStrong = firstCell.querySelector('strong');
  if (!firstCellStrong) {
    return // Not a real definition row
  }
  const firstCellStrongChildren = Array.from(firstCellStrong.childNodes).filter(node => node.nodeName != 'A');
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
}


function extractBackText(trGroup) {
  return `${getLanguageCodes()[1].toUpperCase()}\n` + trGroup
  .filter(tr => !(parseInt(tr.querySelector('td:last-child').getAttribute('colspan')) > 1))
  .map(tr => {
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
}



function addHooksInTrGroup(trGroup) {
  const hook = createHook(extractFrontText(trGroup), extractBackText(trGroup), trGroup);
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
