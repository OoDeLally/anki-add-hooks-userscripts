import ScrapingError from '../scraping_error';
import { ANKI_ADD_BUTTON_CLASS_SELECTOR } from '../constants';

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
    throw ScrapingError(`No id matches the pattern ${pattern}`);
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
    if (error.name === 'ScrapingError') {
      throw ScrapingError(error.message); // Remove the extra stackframe
    } else {
      throw error;
    }
  }
  if (matchingNodes.length > 1 && throwOnFoundSeveral) {
    throw ScrapingError(`Several ids match the pattern ${pattern}`);
  }
  return matchingNodes[0];
};


const querySelectorAllInOneNode = (parentNode, selector, { throwOnUnfound = true } = {}) => {
  if (!parentNode || !parentNode.querySelectorAll) {
    throw Error(`parentNode does not seem to be a DOM node: ${parentNode}`);
  }

  if (typeof selector !== 'string') {
    throw Error('selector must be a string');
  }
  const foundNodes = Array.from(parentNode.querySelectorAll(selector));
  if (foundNodes.length === 0 && throwOnUnfound) {
    throw ScrapingError(`No node matches the selector '${selector}'`);
  }
  return foundNodes;
};


const getElementsByNameInOneNode = (parentNode, name, { throwOnUnfound = true } = {}) => {
  if (!parentNode || !parentNode.getElementsByName) {
    throw Error(`parentNode does not seem to be a DOM node: ${parentNode}`);
  }
  if (typeof name !== 'string') {
    throw Error('name must be a string');
  }
  const foundNodes = Array.from(parentNode.getElementsByName(name));
  if (foundNodes.length === 0 && throwOnUnfound) {
    throw ScrapingError(`No node matches the name '${name}'`);
  }
  return foundNodes;
};


// Just like parentNode.querySelectorAll, but:
// - can throw if not found.
// - accepts parentNode as an array of nodes to look from.
export const querySelectorAll = (parentNode, selector, options = {}) => {
  if (typeof options !== 'object') {
    throw Error('If provided, `options`, must be an object');
  }
  if (Array.isArray(parentNode)) {
    let results = [];
    parentNode.forEach((node) => {
      const foundNodes = querySelectorAllInOneNode(node, selector, { throwOnUnfound: false });
      results = [...results, ...foundNodes];
    });
    if (results.length > 1 && options.throwOnFoundSeveral) {
      throw ScrapingError(`Several nodes match the selector '${selector}'`);
    }
    return results;
  } else {
    return querySelectorAllInOneNode(parentNode, selector, options);
  }
};


// Just like parentNode.querySelector, but:
// - can throw if not found, or several found.
// - accepts parentNode as an array of nodes to look from.
export const querySelector = (
  parentNode, selector, { throwOnUnfound = true, throwOnFoundSeveral = true } = {}
) => {
  let matchingNodes;
  try {
    matchingNodes = querySelectorAll(parentNode, selector, { throwOnUnfound });
  } catch (error) {
    if (error.name === 'ScrapingError') {
      throw ScrapingError(error.message); // Remove the extra stackframe
    } else {
      throw error;
    }
  }
  if (matchingNodes.length > 1 && throwOnFoundSeveral) {
    throw ScrapingError(`Several nodes match the selector '${selector}'`);
  }
  return matchingNodes[0];
};


// Just like parentNode.getElementsByName, but:
// - can throw if not found.
// - accepts parentNode as an array of nodes to look from.
export const getElementsByName = (parentNode, name, options = {}) => {
  if (typeof options !== 'object') {
    throw Error('If provided, `options`, must be an object');
  }
  if (Array.isArray(parentNode)) {
    let results = [];
    parentNode.forEach((node) => {
      const foundNodes = getElementsByNameInOneNode(node, name, { throwOnUnfound: false });
      results = [...results, ...foundNodes];
    });
    if (results.length > 1 && options.throwOnFoundSeveral) {
      throw ScrapingError(`Several nodes match the name '${name}'`);
    }
    return results;
  } else {
    return getElementsByNameInOneNode(parentNode, name, options);
  }
};


// Just like parentNode.getOneElementByName, but:
// - can throw if not found, or several found.
// - accepts parentNode as an array of nodes to look from.
export const getOneElementByName = (
  parentNode, name, { throwOnUnfound = true, throwOnFoundSeveral = true } = {}
) => {
  let matchingNodes;
  try {
    matchingNodes = getElementsByName(parentNode, name, { throwOnUnfound });
  } catch (error) {
    if (error.name === 'ScrapingError') {
      throw ScrapingError(error.message); // Remove the extra stackframe
    } else {
      throw error;
    }
  }
  if (matchingNodes.length > 1 && throwOnFoundSeveral) {
    throw ScrapingError(`Several nodes match the name '${name}'`);
  }
  return matchingNodes[0];
};


// Tells if `parentNode` already contains an anki hook.
// `parentNode` can be an array of nodes to look from.
export const doesAnkiHookExistIn = parentNode =>
  !!querySelector(
    parentNode,
    ANKI_ADD_BUTTON_CLASS_SELECTOR,
    { throwOnUnfound: false }
  );
