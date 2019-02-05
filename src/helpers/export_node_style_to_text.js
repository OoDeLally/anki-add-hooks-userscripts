const ankiDefaultStyles = {
  bottom: 'auto',
  boxShadow: 'none',
  boxSizing: 'border-box',
  clear: 'none',
  color: 'rgb(0, 0, 0)',
  direction: 'ltr',
  flex: '0 1 auto',
  float: 'none',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: '400',
  left: 'auto',
  lineHeight: '18px',
  listStyle: 'disc outside none',
  margin: '0px',
  opacity: '1',
  order: '0',
  overflow: 'visible',
  overflowAnchor: 'auto',
  overflowWrap: 'normal',
  overflowX: 'visible',
  overflowY: 'visible',
  padding: '0px',
  position: 'static',
  right: 'auto',
  stroke: 'none',
  tableLayout: 'auto',
  textAlign: 'start',
  textDecorationLine: 'none',
  textIndent: '0px',
  textOrientation: 'mixed',
  textOverflow: 'clip',
  textSizeAdjust: '100%',
  top: 'auto',
  wordBreak: 'normal',
  wordSpacing: '0px',
  wordWrap: 'normal',
  zIndex: 'auto',
  zoom: '1',
};

const toKebabCase = text => text.replace(/([A-Z])/g, (str, letter) => `-${letter.toLowerCase()}`);


// export remarkable style attributes to text
export default (node) => {
  const nodeStyle = window.getComputedStyle(node);
  // console.log('nodeStyle:', nodeStyle);
  const styleChunks = Object.keys(ankiDefaultStyles).reduce((elements, styleKey) => {
    const propertyValue = nodeStyle[styleKey];
    const defaultValue = ankiDefaultStyles[styleKey];
    if (
      propertyValue
      && propertyValue !== defaultValue
      && propertyValue !== window.getComputedStyle(node.parentNode)[styleKey]
    ) {
      elements.push(`${toKebabCase(styleKey)}:${propertyValue};`);
      // console.log(`${toKebabCase(styleKey)}:${propertyValue};`);
    }
    return elements;
  }, []);
  // console.log('node.nodeName:', node.nodeName)
  // console.log('nodeStyle.display:', nodeStyle.display)
  if (
    (node.nodeName === 'DIV' && nodeStyle.display !== 'block')
    || (node.nodeName === 'TR' && nodeStyle.display !== 'table-row')
    || (node.nodeName === 'TD' && nodeStyle.display !== 'table-cell')
    || (node.nodeName !== 'DIV' && nodeStyle.display === 'block')
  ) {
    styleChunks.push(`display:${nodeStyle.display};`);
  // console.log('`display:${nodeStyle.display};`:', `display:${nodeStyle.display};`)
  }

  if (nodeStyle.borderStyle !== 'none') {
    styleChunks.push(`border:${nodeStyle.border};`);
  }

  if (node.style.width) {
    styleChunks.push(`width:${node.style.width};`);
  }
  if (node.style.height) {
    styleChunks.push(`height:${node.style.height};`);
  }


  return styleChunks.join('');
};
