import ScrappingError from '../scrapping_error';

let allIds = null;

// Return the list of nodes with an id matching the provided pattern
export const getNodesWithIdMatchingRegExp = (pattern, { throwOnUnfound = true } = {}) => {
  if (allIds == null) {
    allIds = Array.from(document.querySelectorAll('*[id]'));
  }
  let nodes;
  if (typeof pattern === 'string') {
    nodes = allIds.filter(node => node.id.includes(pattern));
  } else if (pattern instanceof RegExp) {
    nodes = allIds.filter(node => pattern.test(node.id));
  } else {
    console.error('Pattern:', pattern);
    throw Error(`Unexpected pattern type: ${typeof pattern}`);
  }
  if (nodes.length === 0 && throwOnUnfound) {
    throw ScrappingError(`No id matches the pattern ${pattern}`);
  }
  return nodes;
};


// Return one node with an id matching the provided pattern
export const getNodeWithIdMatchingRegExp = (
  pattern, { throwOnUnfound = true, throwOnFoundSeveral = true } = {}
) => {
  let matchingNodes;
  try {
    matchingNodes = getNodesWithIdMatchingRegExp(pattern, { throwOnUnfound });
  } catch (error) {
    if (error.name === 'SrappingError') {
      throw ScrappingError(error.message); // Remove the extra stackframe
    } else {
      throw error;
    }
  }
  if (matchingNodes.length > 1 && throwOnFoundSeveral) {
    throw ScrappingError(`Several ids match the pattern ${pattern}`);
  }
  return matchingNodes[0];
};
