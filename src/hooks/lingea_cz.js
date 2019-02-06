// @name         Anki Add Hooks for lingea.cz
// @version      0.1
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/

import stringifyNodeWithStyle from '../helpers/stringify_node_with_style';
import isTextNode from '../helpers/is_text_node';


export const hookName = 'lingea.cz';


// On Lingea.cz each word is surrounded by a <w>.
// It is useless for our purpose, so we drop it in order to be leaner.
const dropWTags = (node) => {
  node.childNodes.forEach((childNode) => {
    if (
      childNode.nodeName === 'W'
      && childNode.childNodes.length === 1
      && isTextNode(childNode.childNodes[0])
    ) {
      childNode.replaceWith(childNode.childNodes[0]);
    }
    return dropWTags(childNode);
  });
  return node;
};

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


const extractFrontText = () => {
  const node = document.querySelector('table.entry  .head .lex_ful_entr');
  return stringifyNodeWithStyle(node, dropFrontTextJunk);
};

const extractBackText = () => {
  const translationRows = Array.from(document.querySelectorAll('.entry tr'))
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const definitionText = translationRows.map(tr => stringifyNodeWithStyle(tr, dropWTags)).join('');
  return `<table>${definitionText}</table>`;
};

const extractCardKind = () => {
  const match = window.location.href.match(/lingea\.cz\/(\w+-\w+)\//);
  if (!match) {
    throw Error('Failed to extract direction');
  }
  return match[1];
};


export const extract = () => ({
  frontText: extractFrontText(),
  backText: extractBackText(),
  frontLanguage: null,
  backLanguage: null,
  cardKind: extractCardKind(),
});


export const run = (createHook) => {
  setInterval(() => {
    const parentNode = document.querySelector('.entry  tr.head td');
    if (!parentNode) {
      return; // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return; // Hook already exists
    }
    const hook = createHook();
    hook.style.position = 'absolute';
    hook.style.right = '10px';
    parentNode.appendChild(hook);
  }, 500);
};
