import isTextNode from './is_text_node';
import exportNodeStyleToText from './export_node_style_to_text';
import { ANKI_ADD_BUTTON_CLASS } from '../constants';


// Recursively clone node and assign explicit style to the clone.
// Useful when you extract a node out of its class' scope.
const cloneNodeWithExplicitStyle = (originalNode) => {
  // console.log('originalNode:', originalNode)
  if (originalNode.nodeType === undefined) {
    throw Error(`Provided 'originalNode' is not a DOM node; instead got ${typeof originalNode}.`);
  }
  if (isTextNode(originalNode)) {
    return originalNode.cloneNode();
  }
  const cloneNode = originalNode.cloneNode();
  cloneNode.removeAttribute('id');
  cloneNode.removeAttribute('class');
  cloneNode.removeAttribute('name');
  const styleText = exportNodeStyleToText(originalNode);
  cloneNode.style.cssText = styleText;
  if (originalNode.childNodes) {
    originalNode.childNodes.forEach(
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
    // .replace(/\s*name=""\s*/gm, ' ')
    // .replace(/\s*class=""\s*/gm, ' ')
    // .replace(/\s*id=""\s*/gm, ' ');


// Create a stringified html screenshot of one or several node(s), with style! 😎
// transformTree   function     transform the node tree before stringify it.
const stringifyNodeWithStyle = (node, transformTree = (a => a)) => {
  if (Array.isArray(node)) {
    return node.map(elt => stringifyNodeWithStyle(elt, transformTree)).join('');
  }
  const clonedTree = cloneNodeWithExplicitStyle(node);
  const transformedTree = transformTree(clonedTree);
  if (isTextNode(transformedTree)) {
    return transformedTree.textContent;
  } else {
    return removeEmptyTagAttributes(replaceAllCssColorToHexa(transformedTree.outerHTML));
  }
};

export default stringifyNodeWithStyle;
