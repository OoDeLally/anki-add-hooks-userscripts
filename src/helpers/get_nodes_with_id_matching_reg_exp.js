let allIds = null;

// Return the list of nodes with an id matching the provided pattern
export default (pattern) => {
  if (allIds == null) {
    allIds = Array.from(document.querySelectorAll('*[id]'));
  }
  if (typeof pattern === 'string') {
    return allIds.filter(node => node.id.includes(pattern));
  } else if (pattern instanceof RegExp) {
    return allIds.filter(node => pattern.test(node.id));
  } else {
    console.error('Pattern:', pattern);
    throw Error(`Unexpected pattern type: ${typeof pattern}`);
  }
};
