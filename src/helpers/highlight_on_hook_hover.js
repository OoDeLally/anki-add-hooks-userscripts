// Highlight `elementsToHighlight` with `backgroundColor` when the user hovers the hook `hookNode`.
export default (hookNode, elementsToHighlight, backgroundColor) => {
  if (elementsToHighlight.forEach) {
    hookNode.onmouseover = () => {
      elementsToHighlight.forEach((elt) => {
        elt.style.background = backgroundColor;
      });
    };
    hookNode.onmouseout = () => {
      elementsToHighlight.forEach((elt) => {
        elt.style.background = null;
      });
    };
  } else {
    hookNode.onmouseover = () => {
      elementsToHighlight.style.background = backgroundColor;
    };
    hookNode.onmouseout = () => {
      elementsToHighlight.style.background = null;
    };
  }
};
