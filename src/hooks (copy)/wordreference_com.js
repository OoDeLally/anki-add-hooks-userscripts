// @name         Anki Add Hooks for WordReference.com
// @version      0.1
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/


function getLanguageCodes() {
  const match = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})\//);
  return [match[1], match[2]];
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
  const parent = trGroup[0].querySelector('td');
  parent.style.position = 'relative';
  const hook = createHook(trGroup);
  hook.style.position = 'absolute';
  hook.style.left = '-80px';
  parent.prepend(hook);
}


function addHooksInTable(tableNode){
  getTrGroups(tableNode).forEach(addHooksInTrGroup);
}


function getTables() {
  return document.querySelectorAll('.WRD');
}

function extractDirection() {
  const languageCodes = getLanguageCodes();
  return `${languageCodes[0]} -> ${languageCodes[1]}`;
}


function run(){
  getTables().forEach(addHooksInTable);
}
