import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import extractCardKind from './extract_card_kind';
import dropWTags from './drop_w_tags';
import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import ScrapingError from '../../scraping_error';


const dropFrontTextJunk = (node) => {
  const childNodesToRemove = [];
  node.childNodes.forEach((childNode) => {
    if (
      // childNode.nodeName === 'SUP' // e.g. "do¹"
      // ||
      childNode.nodeValue === '*' // e.g. "do*"
    ) {
      childNodesToRemove.push(childNode);
    }
  });
  childNodesToRemove.forEach(childNode => childNode.remove());
  return node;
};


const extractFrontText = (headerNodes) => {
  const hmtl = headerNodes
    .map(headerNode => stringifyNodeWithStyle(headerNode, dropFrontTextJunk))
    .join('<br/>');
  return `<div style="display:table;margin:auto;text-align:left;">${hmtl}</div>`;
};


const extractBackText = () => {
  const translationRows = querySelectorAll(document, '.entry tr')
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const definitionText = translationRows.map(tr => stringifyNodeWithStyle(tr, dropWTags)).join('');
  return `<table style="text-align:left;margin:auto;">${definitionText}</table>`;
};


const extractCallback = headerNodes => ({
  frontText: extractFrontText(headerNodes),
  backText: extractBackText(),
  frontLanguage: null,
  backLanguage: null,
  cardKind: `${extractCardKind()} Main Term`,
});


export default (createHook) => {
  // Sometimes there will be several headerNodes e.g. when searching for `rozlétly`.
  // In such case we only put the button to the first row.
  const headerNodes = querySelectorAll(document, '.entry  tr.head td', { throwOnUnfound: false });
  if (headerNodes.length === 0) {
    if (querySelector(document, '.no_entry_found')) {
      return; // Word was not found
    } else {
      throw ScrapingError('Translation was not found, and .no_entry_found was not found.');
    }
  }
  const parentNode = headerNodes[0];
  if (doesAnkiHookExistIn(parentNode)) {
    return;
  }
  const hook = createHook(() => extractCallback(headerNodes));
  hook.style.position = 'absolute';
  hook.style.right = '10px';
  const mainPanel = querySelectorAll(document, '.entry');
  highlightOnHookHover(hook, mainPanel, 'lightblue');
  parentNode.appendChild(hook);
};
