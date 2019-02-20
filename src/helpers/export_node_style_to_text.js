const ankiDefaultStyles = {
  bottom: ['auto', '0px'],
  boxShadow: 'none',
  boxSizing: 'border-box',
  clear: 'none',
  color: 'rgb(0, 0, 0)',
  direction: ['', 'ltr'],
  flex: '0 1 auto',
  float: 'none',
  fontSize: '20px',
  fontStyle: 'normal',
  fontWeight: '400',
  left: ['auto', '0px'],
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
  right: ['auto', '0px'],
  stroke: 'none',
  tableLayout: 'auto',
  textAlign: 'start',
  textDecorationLine: 'none',
  textIndent: '0px',
  textOrientation: 'mixed',
  textOverflow: 'clip',
  textSizeAdjust: '100%',
  top: ['auto', '0px'],
  verticalAlign: 'baseline',
  wordBreak: 'normal',
  wordSpacing: '0px',
  wordWrap: 'normal',
  zIndex: 'auto',
  zoom: '1',
};

const getStyleDefaultValues = (key) => {
  const value = ankiDefaultStyles[key];
  return Array.isArray(value) ? value : [value];
};


const toKebabCase = text => text.replace(/([A-Z])/g, (str, letter) => `-${letter.toLowerCase()}`);


// Export remarkable style attributes to text.
export default (node) => {
  const nodeStyle = window.getComputedStyle(node);
  // console.log('nodeStyle:', nodeStyle);
  const styleChunks = Object.keys(ankiDefaultStyles).reduce((elements, styleKey) => {
    const propertyValue = nodeStyle[styleKey];
    const defaultValues = getStyleDefaultValues(styleKey);
    if (
      propertyValue
      && !defaultValues.includes(propertyValue)
    ) {
      elements.push(`${toKebabCase(styleKey)}:${propertyValue};`);
      // console.log(`${toKebabCase(styleKey)}:${propertyValue};`);
    }
    return elements;
  }, []);
  // console.log('node.nodeName:', node.nodeName)
  // console.log('nodeStyle.fontSize:', nodeStyle.fontSize)
  if (
    (['DIV', 'H1', 'H2', 'H3', 'H4', 'H5'].includes(node.nodeName) && nodeStyle.display !== 'block')
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
