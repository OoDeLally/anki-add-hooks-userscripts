import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import isTextNode from '../../helpers/is_text_node';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';


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

const moveWordNatureNodeNearWordNode = (div) => {
  const bNodes = div.querySelectorAll('b');
  const wordNode = bNodes[0];
  const wordNatureNode = bNodes[1];
  wordNode.append(wordNatureNode);
  return div;
};

const composeFunctions = (...funs) =>
  (...args) => {
    let val = args;
    funs.forEach((fun) => {
      val = [fun(...val)];
    });
    return val[0];
  };

const extractFrontText = (divGroup) => {
  const transformTree = composeFunctions(cleanTree, moveWordNatureNodeNearWordNode);
  return stringifyNodeWithStyle(divGroup[0], transformTree);
};

const extractBackText = (divGroup) => {
  const [, ...rest] = divGroup;
  return `<div style="text-align:left;margin:auto;display:table;">
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


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});

export const run = (createHook) => {
  const translateBox = document.getElementsByName('translate_box')[0];
  if (!translateBox) {
    return;
  }
  const wordNodes = translateBox.querySelectorAll('div b:first-child');
  wordNodes.forEach((wordNode, wordNodeIndex) => {
    const divGroup = getDivGroup(wordNode, wordNodes[wordNodeIndex + 1]);
    const hook = createHook({ type: 'collins', data: divGroup });
    hook.style.position = 'absolute';
    hook.style.right = '0px';
    hook.style.top = '10px';
    highlightOnHookHover(hook, divGroup, 'lightblue');
    wordNode.parentNode.style.position = 'relative';
    wordNode.parentNode.append(hook);
  });
};
