import isTextNode from '../../helpers/is_text_node';

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

export default dropWTags;
