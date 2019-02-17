// @name         Anki Add Hooks for WordReference.com
// @version      2.1
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/

import stringifyNodeWithStyle from '../helpers/stringify_node_with_style';
import highlightOnHookHover from '../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll } from '../helpers/scraping';
import ScrapingError from '../scraping_error';


// Wordreference entries are laid as following:
// <tr class="even">
//   <td>First entry</td>
//   <td>additional info of first entry</td>
//   <td>translation of first entry</td>
// </tr>
// <tr class="even">
//   <td>&nbsp;</td>
//   <td>additional info of first entry</td>
//   <td>translation of first entry</td>
// </tr>
// <tr class="odd">
//   <td>Second entry</td>
//   <td>additional info of second entry</td>
//   <td>translation of second entry</td>
// </tr>
// <tr class="odd">
//   <td>&nbsp;</td>
//   <td>additional info of second entry</td>
//   <td>translation of second entry</td>
// </tr>
// <tr class="odd">
//   <td>&nbsp;</td>
//   <td>additional info of second entry</td>
//   <td>translation of second entry</td>
// </tr>
// <tr class="even">
//   <td>Third entry</td>
//   <td>additional info of third entry</td>
//   <td>translation of third entry</td>
// </tr>
// <tr class="even">
//   <td>&nbsp;</td>
//   <td>additional info of third entry</td>
//   <td>translation of third entry</td>
// </tr>
// Each entry can occupy several <tr>s, and one good way to distinguish them is
// to monitor the alternance of <tr class="even"> and <tr class="odd">.
const getTrGroups = (tableNode) => {
  const trGroups = [];
  let currentTrGroup = [];
  let currentTrClass = 'even';
  querySelectorAll(tableNode, '.even, .odd', { throwOnUnfound: false })
    .sort((a, b) => a.rowIndex - b.rowIndex)
    .forEach((trNode) => {
      if (trNode.className.includes(currentTrClass)) {
        currentTrGroup.push(trNode);
      } else {
        trGroups.push(currentTrGroup);
        currentTrGroup = [trNode];
        currentTrClass = currentTrClass === 'even' ? 'odd' : 'even';
      }
    });
  trGroups.push(currentTrGroup);
  return trGroups;
};


const getExamplesTdFromTrGroup = (trGroup, exampleClassName) =>
  Array.from(trGroup)
    .map(trNode => querySelectorAll(trNode, 'td')[1])
    .filter(td => td && td.className && td.className.includes(exampleClassName))
    .map(td => `<div style="color:#808080;">${td.innerText}</div>`);

const getAdditionalInfosFromTrGroup = trGroup =>
  trGroup
    .map(trNode => querySelectorAll(trNode, 'td')[1])
    .filter(td => td && !td.className.includes('FrEx') && !td.className.includes('ToEx'))
    .map(td => Array.from(td.childNodes))
    .map(
      nodes => nodes
        .filter(node => !node.className || !node.className.includes('dsense'))
        .map(node => stringifyNodeWithStyle(node).trim())
        .filter(html => html)
    )
    .filter(stringifiedNodes => stringifiedNodes.length > 0)
    .map(stringifiedNodes => `<div>${stringifiedNodes.join('')}</div>`);


const extractFrontText = (trGroup) => {
  const wordNode = querySelector(trGroup[0], 'td', { throwOnFoundSeveral: false });
  const additionalInfos = getAdditionalInfosFromTrGroup(trGroup);
  const examples = getExamplesTdFromTrGroup(trGroup, 'FrEx');
  return [
    stringifyNodeWithStyle(wordNode),
    (additionalInfos.length > 0 ? '<br/>' : ''),
    ...additionalInfos,
    (examples.length > 0 ? '<br/>' : ''),
    ...examples,
  ].join('');
};


const extractBackText = (trGroup) => {
  const extractedRows = trGroup
    .map((trNode) => {
      const [, secondCell, thirdCell] = querySelectorAll(trNode, 'td');
      if (!thirdCell) {
        return null;
      }
      const additionalInfo = querySelectorAll(secondCell, '.dsense', { throwOnUnfound: false });
      return `<tr>
                <td>
                  ${additionalInfo ? stringifyNodeWithStyle(additionalInfo) : ''}
                </td>
                ${stringifyNodeWithStyle(thirdCell)}
              </tr>`;
    })
    .filter(tr => tr);
  const examples = getExamplesTdFromTrGroup(trGroup, 'ToEx');
  return `<table style="margin:auto;text-align:left;">
            ${extractedRows.join('')}
          </table>
          ${examples.length > 0 ? `<br/>${examples.join('')}` : ''}
          `;
};


const getLanguages = () => {
  const urlMatch = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})(\/(reverse))?\//);
  if (urlMatch[4] === 'reverse') {
    // e.g. http://www.wordreference.com/czen/reverse/foobar means en -> cz
    return [urlMatch[2], urlMatch[1]];
  } else {
    // e.g. http://www.wordreference.com/czen/foobar means cz -> en
    return [urlMatch[1], urlMatch[2]];
  }
};


const extractCallback = (trGroup) => {
  const [sourceLanguage, targetLanguage] = getLanguages();
  // console.log('extractFrontText(trGroup):', extractFrontText(trGroup))
  return {
    frontText: extractFrontText(trGroup),
    backText: extractBackText(trGroup),
    frontLanguage: sourceLanguage,
    backLanguage: targetLanguage,
    cardKind: `${sourceLanguage} -> ${targetLanguage}`,
  };
};


const addHooksInTrGroup = (trGroup, createHook) => {
  const parent = querySelector(trGroup[0], 'td:last-child');
  parent.style.position = 'relative';
  const hook = createHook(() => extractCallback(trGroup));
  hook.style.position = 'absolute';
  hook.style.right = '-80px';
  highlightOnHookHover(hook, trGroup, 'gold');
  parent.append(hook);
};


const addHooksInTable = (tableNode, createHook) => {
  getTrGroups(tableNode).forEach(trGroup => addHooksInTrGroup(trGroup, createHook));
};


const getTables = () => {
  // Search for translation tables
  const tables = querySelectorAll(document, '.WRD', { throwOnUnfound: false });
  if (tables.length > 0) {
    return tables;
  }
  // tables.length == 0. Does it mean that the word wasnt found?
  const wordNotFoundNotifNode = querySelector(document, '#noEntryFound', { throwOnUnfound: false });
  if (wordNotFoundNotifNode) {
    return []; // The word was not found, so we simply return no table.
  }
  throw ScrapingError('.WRD table was not found and #noEntryFound was not found');
};


export const hookName = 'wordreference.com';

export const run = (createHook) => {
  getTables().forEach(tableNode => addHooksInTable(tableNode, createHook));
};
