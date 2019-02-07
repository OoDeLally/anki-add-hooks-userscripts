import isTextNode from './is_text_node';
import exportNodeStyleToText from './export_node_style_to_text';
import { ANKI_ADD_BUTTON_CLASS } from '../constants';


// Recursively clone node and assign explicit style to the clone.
// Useful when you extract a node out of its class' scope.
const cloneNodeWithExplicitStyle = (node) => {
  if (node.nodeType === undefined) {
    throw Error(`Provided 'node' is not a DOM node; instead got ${typeof node}.`);
  }
  if (isTextNode(node)) {
    return node.cloneNode();
  }
  const cloneNode = node.cloneNode();
  cloneNode.removeAttribute('class');
  const styleText = exportNodeStyleToText(node);
  // console.log('styleText:', styleText);
  cloneNode.style.cssText = styleText;
  if (node.childNodes) {
    node.childNodes.forEach(
      (childNode) => {
        if (isTextNode(childNode)) {
          cloneNode.append(childNode.cloneNode());
          return;
        }
        if (childNode.className && childNode.className.includes(ANKI_ADD_BUTTON_CLASS)) {
          return; // Ignore anki button
        }
        const childNodeStyle = window.getComputedStyle(childNode);
        if (childNodeStyle.display === 'none' || childNodeStyle.opacity === '0') {
          return; // Ignore the hidden elements
        }
        cloneNode.append(cloneNodeWithExplicitStyle(childNode));
      }
    );
  }
  return cloneNode;
};


const padTo2With0 = stringNumber => (stringNumber.length === 1 ? `0${stringNumber}` : stringNumber);

const decToHexa = text => padTo2With0(parseInt(text, 10).toString(16));

const replaceAllCssColorToHexa = text =>
  text.replace(
    /\brgb\((\d+), (\d+), (\d+)\)/gm,
    (str, r, g, b) => `#${decToHexa(r)}${decToHexa(g)}${decToHexa(b)}`
  );

const removeEmptyTagAttributes = text =>
  text
    .replace(/\s*style=""\s*/gm, ' ')
    .replace(/\s*name=""\s*/gm, ' ')
    .replace(/\s*class=""\s*/gm, ' ');

// Create a stringified html screenshot of a node, with style! 😎
// transformTree   function     transform the node tree before stringify it.
export default (node, transformTree = (a => a)) => {
  const transformedTree = transformTree(cloneNodeWithExplicitStyle(node));
  if (isTextNode(transformedTree)) {
    return transformedTree.textContent;
  } else {
    return removeEmptyTagAttributes(replaceAllCssColorToHexa(transformedTree.outerHTML));
  }
};
