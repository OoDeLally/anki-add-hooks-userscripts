export default node =>
  Array.from(node.parentNode.childNodes).indexOf(node);
