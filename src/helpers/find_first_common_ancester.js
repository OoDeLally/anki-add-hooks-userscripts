const findAllParents = (node) => {
  const parents = [];
  do {
    parents.push(node);
    node = node.parentNode;
  } while (node);
  return parents;
};

const findFirstCommonItem = (itemLists) => {
  if (itemLists.length === 0) {
    return null;
  }
  if (itemLists.length === 1) {
    return itemLists[0] || null;
  }
  const [firstList, ...otherLists] = itemLists;
  for (const item of firstList) {
    let itemFoundInAll = true;
    for (const otherList of otherLists) {
      if (!otherList.includes(item)) {
        itemFoundInAll = false;
        break;
      }
    }
    if (itemFoundInAll) {
      return item; // All lists have this item too.
    }
  }
  return null;
};

export const findFirstCommonAncester = (nodes) => {
  const allParents = nodes.map(findAllParents);
  return findFirstCommonItem(allParents);
};
