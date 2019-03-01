const findFirstAncestor = (node, ancestorPredicate) => {
  const { parentNode } = node;
  if (!parentNode) {
    return null;
  }
  if (ancestorPredicate(parentNode)) {
    return parentNode;
  }
  return findFirstAncestor(parentNode, ancestorPredicate);
};


export default findFirstAncestor;
