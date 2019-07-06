import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import isTextNode from '../../helpers/is_text_node';
import extractCardKind from './extract_card_kind';
import dropWTags from './drop_w_tags';
import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import findFirstAncestor from '../../helpers/find_first_ancestor';
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

const convertRootNodeToDiv = (tdNode) => {
    const divNode = document.createElement('DIV');
    tdNode.childNodes.forEach((childNode) => {
      divNode.appendChild(childNode);
    });
    return divNode;
  };


const extractFrontText = (headerNodes) => {
  const hmtl = headerNodes
    .map(headerNode => stringifyNodeWithStyle(headerNode, composeFunctions(dropFrontTextJunk, convertRootNodeToDiv)))
    .join('<br/>');
  return `<div style="display:table;margin:auto;text-align:left;">${hmtl}</div>`;
};


const getWordToSubstitute = (headerNode) => {
  const h1 = querySelector(headerNode, '.lex_ful_entr', { throwOnUnfound: false });
  if (!h1) {
    return null;
  }
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


const extractBackText = (headerNodes, backSideTrs) => {
  const translationRows = backSideTrs
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const wordsToSubstitute = headerNodes.map(getWordToSubstitute).filter(w => w);
  const definitionText = translationRows.map(
    tr =>
      stringifyNodeWithStyle(
        tr,
        composeFunctions(dropWTags, replaceWordsOccurencesByWildcards(wordsToSubstitute), convertRootNodeToDiv)
      )
  ).join('');
  return `<table style="text-align:left;margin:auto;">${definitionText}</table>`;
};


const extractCallback = (headerNodes, backSideTrs) => ({
  frontText: extractFrontText(headerNodes),
  backText: extractBackText(headerNodes, backSideTrs),
  frontLanguage: null,
  backLanguage: null,
  cardKind: `${extractCardKind()} Main Term`,
});


// Some words have only one nature. e.g. `hrabat` can only be a verb.
const runOnSingleNature = (headerNodes, createHook) => {
  const parentNode = headerNodes[0];
  if (doesAnkiHookExistIn(parentNode)) {
    return;
  }
  const backSideTrs = querySelectorAll(document, '.entry tr');
  const hook = createHook(() => extractCallback(headerNodes, backSideTrs));
  hook.style.position = 'absolute';
  hook.style.right = '0px';
  const mainPanel = querySelectorAll(document, '.entry');
  highlightOnHookHover(hook, mainPanel, 'lightblue');
  parentNode.appendChild(hook);
};


// Some words can have several natures. e.g. `land` is both an verb, a noun and an adjective.
const runOnMultipleNatures = (headerNodes, firstTrs, createHook) => {
  // For each firstTr, we take every tr until the next one:
  // <table>
  //   <tr>nature 0 - firstTr</tr>
  //   <tr>nature 0 - def 0</tr>
  //   <tr>nature 0 - def 1</tr>
  //   <tr>nature 0 - def 2</tr>
  //   <tr>nature 1 - firstTr</tr>
  //   <tr>nature 1 - def 0</tr>
  //   <tr>nature 2 - firstTr</tr>
  //   <tr>nature 2 - def 0</tr>
  //   <tr>nature 2 - def 1</tr>
  //   <tr>nature 2 - def 1</tr>
  // <table>
  firstTrs.forEach((firstTr, firstTrIndex) => {
    if (doesAnkiHookExistIn(firstTr)) {
      return;
    }
    if (firstTr.innerText === 'phr') {
      return; // phrase example. Those are handled differently by another function.
    }
    const nextFirstTr = firstTrs[firstTrIndex + 1];
    const backSideTrs = [];
    let currentTr = firstTr;
    do {
      backSideTrs.push(currentTr);
      currentTr = currentTr.nextSibling;
    } while (currentTr && currentTr !== nextFirstTr);
    const hook = createHook(() => extractCallback([...headerNodes, firstTr], backSideTrs));
    hook.style.position = 'absolute';
    hook.style.right = '0px';
    highlightOnHookHover(hook, [...backSideTrs, ...headerNodes], 'lightblue');
    const parentNode = querySelector(firstTr, 'td:last-child');
    parentNode.style.position = 'relative';
    parentNode.appendChild(hook);
  });
};


export default (createHook) => {
  // Sometimes there will be several headerNodes e.g. when searching for `rozlétly`.
  // In such case we only put the button to the first row.
  const headerNodes = querySelectorAll(document, '.entry  tr.head td', { throwOnUnfound: false });
  if (headerNodes.length === 0) {
    return; // Word was not found, or error 505, or captcha
  }

  const termNatureNodes = querySelectorAll(document, 'td:first-child .lex_ful_morf:first-child', { throwOnUnfound: false });
  // Whether the word has several natures or just one, the layout is different.
  if (termNatureNodes.length > 0) {
    runOnMultipleNatures(
      headerNodes,
      termNatureNodes.map(termNatureNode => findFirstAncestor(termNatureNode, node => node.nodeName === 'TR')),
      createHook
    );
  }
  // Nature `phr` doesnt count since it is usually just a idiom using the word in question
  if (termNatureNodes.filter(node => node.innerText !== 'phr').length === 0) {
    runOnSingleNature(headerNodes, createHook);
  }
};
