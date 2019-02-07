
// Tells if a node is a TextNode
export default (node) => {
  if (!node || node.nodeType === undefined) {
    throw Error(`Provided 'node' is not a DOM node; instead found '${node}'`);
  }
  return node.nodeType === 3;
};
