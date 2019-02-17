import isTextNode from '../../helpers/is_text_node';


const replaceCommaByLinebreak = (node) => {
  node.childNodes.forEach((childNode) => {
    if (isTextNode(childNode) && childNode.nodeValue === ', ') {
      childNode.replaceWith(document.createElement('BR'));
    }
    return replaceCommaByLinebreak(childNode);
  });
  return node;
};

export default replaceCommaByLinebreak;
