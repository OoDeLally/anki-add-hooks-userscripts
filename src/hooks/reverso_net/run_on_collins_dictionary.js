import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import isTextNode from '../../helpers/is_text_node';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { getElementByName, querySelectorAll } from '../../helpers/scraping';
import getLanguages from './get_languages';
import composeFunctions from '../../helpers/compose_functions';


const cleanTreeRec = (node) => {
  if (
    (node.nodeName === 'SPAN' && !node.textContent.replace(/[ \t]/gm, ''))
    || node.nodeName === 'HR'
  ) {
    node.remove();
    return;
  }
  // Clone the array to avoid screwing the iteration when a child if removed
  Array.from(node.childNodes)
    .forEach(childNode => cleanTreeRec(childNode));
};

const cleanTree = (rootNode) => {
  cleanTreeRec(rootNode);
  return rootNode;
};


/*
  <div>
    <b><h2>FirstWord</h2></b>
    <!-- Stuff -->
    <b>adj</b>
    <!-- First word translation -->
  </div>
  <div>
    <!-- First word translation -->
  </div>
  <div>
    <b>SecondWord</b>
    <!-- Stuff -->
    <b>adj</b>
    <!-- Second word translation -->
  </div>
  <div>
    <!-- Second word translation -->
  </div>

  We need to separate the first div in two, because it contains information
  for both sides of the card.
  We take up to the second <b></b> for the first div.
  The rest of the first div and the subsequent divs are part of the back of the card.
*/
const partitionFrontAndBackInFirstDiv = (divGroup) => {
  const nodes = Array.from(divGroup[0].childNodes);
  const nodesToKeep = [];
  let bNodeSeen = 0;
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
    const node = nodes[nodeIndex];
    nodesToKeep.push(node);
    if (node.nodeName === 'B') {
      bNodeSeen++;
      if (bNodeSeen === 2) {
        return [nodesToKeep, nodes.slice(nodeIndex + 1)];
      }
    }
  }
  return [nodesToKeep, []];
};


const extractFrontText = (divGroup) => {
  const transformTree = composeFunctions(cleanTree);
  return stringifyNodeWithStyle(partitionFrontAndBackInFirstDiv(divGroup)[0], transformTree);
};

const extractBackText = (divGroup) => {
  const [, ...rest] = divGroup;
  return `<div style="text-align:left;margin:auto;display:table;">
            ${stringifyNodeWithStyle(partitionFrontAndBackInFirstDiv(divGroup)[1])}
            ${stringifyNodeWithStyle(rest, cleanTree)}
          </div>
        `;
};


const getDivGroup = (wordNode, nextWordNode) => {
  const divsToHighlight = [];
  if (nextWordNode) {
    let node = wordNode.parentNode;
    while (node && node !== nextWordNode.parentNode) {
      if (!isTextNode(node)) {
        divsToHighlight.push(node);
      }
      node = node.nextSibling;
    }
  } else {
    divsToHighlight.push(wordNode.parentNode);
  }
  return divsToHighlight;
};


export default (createHook) => {
  const translateBox = getElementByName(document, 'translate_box', { throwOnUnfound: false });
  if (!translateBox) {
    return;
  }
  const wordNodes = querySelectorAll(translateBox, 'div > b:first-child', { throwOnUnfound: false });
  wordNodes.forEach((wordNode, wordNodeIndex) => {
    const divGroup = getDivGroup(wordNode, wordNodes[wordNodeIndex + 1]);
    const hook = createHook(() => {
      const [sourceLanguage, targetLanguage] = getLanguages();
      return {
        frontText: extractFrontText(divGroup),
        backText: extractBackText(divGroup),
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    });
    hook.style.position = 'absolute';
    hook.style.right = '0px';
    hook.style.top = '10px';
    highlightOnHookHover(hook, divGroup, 'lightblue');
    wordNode.parentNode.style.position = 'relative';
    wordNode.parentNode.append(hook);
  });
};
