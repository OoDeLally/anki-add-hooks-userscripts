import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import isTextNode from '../../helpers/is_text_node';
import extractCardKind from './extract_card_kind';
import dropWTags from './drop_w_tags';
import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import composeFunctions from '../../helpers/compose_functions';
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


const getWordToSubstitute = (headerNode) => {
  const h1 = querySelector(headerNode, '.lex_ful_entr');
  const word = h1.childNodes[0].textContent.split(/[-. ]/)[0];
  if (!word) {
    throw ScrapingError('Could not find word to substitute');
  }
  return word;
};


// Replace ${wordToSubstitute} by `[.....]` in every node of `rootNode` tree.
// This is use to give away the front side in the backside.
const replaceWordOccurencesByWildcard = (rootNode, wordToSubstitute) => {
  const regexp = new RegExp(`\\b${wordToSubstitute}\\b`, 'igm');
  const substitute = `[${[...Array(wordToSubstitute.length - 1)].map(() => '.').join('')}]`;
  const replaceRec = (node) => {
    node.childNodes.forEach((childNode) => {
      if (isTextNode(childNode)) {
        childNode.textContent = childNode.textContent.replace(regexp, substitute);
      } else {
        replaceRec(childNode);
      }
    });
    return node;
  };
  replaceRec(rootNode);
};


const replaceWordsOccurencesByWildcards = wordsToSubstitute =>
  (node) => {
    wordsToSubstitute.forEach(word => replaceWordOccurencesByWildcard(node, word));
    return node;
  };


const extractBackText = (headerNodes) => {
  const translationRows = querySelectorAll(document, '.entry tr')
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const wordsToSubstitute = headerNodes.map(getWordToSubstitute);
  const definitionText = translationRows.map(
    tr =>
      stringifyNodeWithStyle(
        tr,
        composeFunctions(dropWTags, replaceWordsOccurencesByWildcards(wordsToSubstitute))
      )
  ).join('');
  return `<table style="text-align:left;margin:auto;">${definitionText}</table>`;
};


const extractCallback = headerNodes => ({
  frontText: extractFrontText(headerNodes),
  backText: extractBackText(headerNodes),
  frontLanguage: null,
  backLanguage: null,
  cardKind: `${extractCardKind()} Main Term`,
});


export default (createHook) => {
  // Sometimes there will be several headerNodes e.g. when searching for `rozlétly`.
  // In such case we only put the button to the first row.
  const headerNodes = querySelectorAll(document, '.entry  tr.head td', { throwOnUnfound: false });
  if (headerNodes.length === 0) {
    return; // Word was not found, or error 505, or captcha
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
