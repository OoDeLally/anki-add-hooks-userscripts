import isTextNode from './is_text_node';
import exportNodeStyleToText from './export_node_style_to_text';


// Recursively clone node and assign explicit style to the clone.
// Useful when you extract a node out of its class' scope.
const cloneNodeWithExplicitStyle = (node) => {
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
        if (childNode.style && childNode.style.display === 'none') {
          return;
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
  text.replace(/\s*style=""\s*/gm, ' ');

// Create a stringified html screenshot of a node, with style! 😎
// transformNode function transform
export default (node, transformTree = (a => a)) => {
  const html = transformTree(cloneNodeWithExplicitStyle(node)).outerHTML;
  return removeEmptyTagAttributes(replaceAllCssColorToHexa(html));
};
