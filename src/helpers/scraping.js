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


// Just like parentNode.querySelectorAll, but throws if not found
export const querySelectorAll = (parentNode, selector, { throwOnUnfound = true } = {}) => {
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


// Just like parentNode.querySelector, but throws if not found, or several found
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


// Just like parentNode.getElementsByName, but throws if not found
export const getElementsByName = (parentNode, name, { throwOnUnfound = true } = {}) => {
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


// Just like parentNode.getElementByName (hypothetically), but throws if not found, or several found
export const getElementByName = (
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


export const doesAnkiHookExistIn = parentNode =>
  querySelector(
    parentNode,
    ANKI_ADD_BUTTON_CLASS_SELECTOR,
    { throwOnUnfound: false }
  );
