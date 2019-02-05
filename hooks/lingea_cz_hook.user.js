// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for lingea.cz
// @version      0.1
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
// ==/UserScript==

(function () {
  'use strict';

  

  function __$styleInject ( css ) {
      if(!css) return ;

      if(typeof(window) == 'undefined') return ;
      let style = document.createElement('style');

      style.innerHTML = css;
      document.head.appendChild(style);
      return css;
  }

  __$styleInject(".-anki-quick-adder-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-added .-anki-quick-adder-hook-star-small {\n  color: green;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-quick-adder-hook-text {\n\n}\n");

  // Tells if a node is a TextNode
  var isTextNode = node => node.nodeType === 3;

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


  var exportNodeStyleToText = (node) => {
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

  // Recursively clone node and assign explicit style to the clone.
  // Useful when you extract a node out of its class' scope.
  const cloneNodeWithExplicitStyle = (node) => {
    if (isTextNode(node)) {
      return node.cloneNode();
    }
    const cloneNode = node.cloneNode();
    cloneNode.removeAttribute('class');
    const styleText = exportNodeStyleToText(node);
    // console.log('styleText:', styleText);
    cloneNode.style.cssText = styleText;
    if (node.childNodes) {
      node.childNodes.forEach(
        (childNode) => {
          if (childNode.style && childNode.style.display === 'none') {
            return;
          }
          cloneNode.append(cloneNodeWithExplicitStyle(childNode));
        }
      );
    }
    return cloneNode;
  };


  const padTo2With0 = stringNumber => (stringNumber.length === 1 ? `0${stringNumber}` : stringNumber);

  const decToHexa = text => padTo2With0(parseInt(text, 10).toString(16));

  const replaceAllCssColorToHexa = text =>
    text.replace(
      /\brgb\((\d+), (\d+), (\d+)\)/gm,
      (str, r, g, b) => `#${decToHexa(r)}${decToHexa(g)}${decToHexa(b)}`
    );

  const removeEmptyTagAttributes = text =>
    text.replace(/\s*style=""\s*/gm, ' ');

  // Create a stringified html screenshot of a node, with style! 😎
  // transformNode function transform
  var stringifyNodeWithStyle = (node, transformTree = (a => a)) => {
    const html = transformTree(cloneNodeWithExplicitStyle(node)).outerHTML;
    return removeEmptyTagAttributes(replaceAllCssColorToHexa(html));
  };

  // @name         Anki Add Hooks for lingea.cz


  const hookName = 'lingea.cz';


  // On Lingea.cz each word is surrounded by a <w>.
  // It is useless for our purpose, so we drop it in order to be leaner.
  const dropWTags = (node) => {
    node.childNodes.forEach((childNode) => {
      if (
        childNode.nodeName === 'W'
        && childNode.childNodes.length === 1
        && isTextNode(childNode.childNodes[0])
      ) {
        childNode.replaceWith(childNode.childNodes[0]);
      }
      return dropWTags(childNode);
    });
    return node;
  };

  const dropFrontTextJunk = (node) => {
    const childNodesToRemove = [];
    node.childNodes.forEach((childNode) => {
      if (
        childNode.nodeName === 'SUP' // e.g. "do¹*"
        || childNode.nodeValue === '*' // e.g. "do¹*"
      ) {
        childNodesToRemove.push(childNode);
      }
    });
    childNodesToRemove.forEach(childNode => childNode.remove());
    return node;
  };


  const extractFrontText = () => {
    const node = document.querySelector('table.entry  .head .lex_ful_entr');
    return stringifyNodeWithStyle(node, dropFrontTextJunk);
  };

  const extractBackText = () => {
    const translationRows = Array.from(document.querySelectorAll('.entry tr'))
      .filter(tr => !tr.className || !tr.className.includes('head'));
    const definitionText = translationRows.map(tr => stringifyNodeWithStyle(tr, dropWTags)).join('');
    return `<table>${definitionText}</table>`;
  };

  const extractDirection = () => {
    const match = window.location.href.match(/lingea\.cz\/(\w+-\w+)\//);
    if (!match) {
      throw Error('Failed to extract direction');
    }
    return match[1];
  };

  const run = (createHook) => {
    setInterval(() => {
      const parentNode = document.querySelector('.entry  tr.head td');
      if (!parentNode) {
        return; // Container not found
      }
      const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
      if (existingHook) {
        return; // Hook already exists
      }
      const hook = createHook();
      hook.style.position = 'absolute';
      hook.style.right = '10px';
      parentNode.appendChild(hook);
    }, 500);
  };

  /* global GM */


  const getDeckNameMapKey = directionCode => `deckName_${directionCode.toLowerCase()}`;
  const getModelNameMapKey = directionCode => `modelName_${directionCode.toLowerCase()}`;

  const ankiRequestOnFail = async (response, message, directionCode) => {
    console.error('Anki request response:', response);
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(directionCode), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(directionCode), null);
    }
    alert(`AnkiConnect returned an error:\n${message}`);
  };

  const ankiRequestOnSuccess = (hookNode) => {
    hookNode.classList.add('-anki-quick-adder-hook-added');
    hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';
    hookNode.onclick = () => {};
  };

  const hookOnClick = async (hookNode, frontText, backText, directionCode) => {
    // console.log('frontText:', frontText)
    // console.log('backText:', backText)
    // console.log('directionCode:', directionCode)
    // return
    const deckNameMapKey = getDeckNameMapKey(directionCode);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = prompt(`Enter the name of the deck you want to add '${directionCode}' cards from this website`, 'Default');
      if (!deckName) {
        return; // Cancel
      }
      GM.setValue(deckNameMapKey, deckName);
    }
    const modelNameMapKey = getModelNameMapKey(directionCode);
    let modelName = await GM.getValue(modelNameMapKey);
    if (!modelName) {
      modelName = prompt(`Enter the name of the card model you want to create for '${directionCode}'`, 'Basic (and reversed card)');
      if (!modelName) {
        return; // Cancel
      }
      await GM.setValue(modelNameMapKey, modelName);
    }
    // console.log('hookOnClick')
    const dataStr = JSON.stringify({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName,
          modelName,
          options: {
            allowDuplicate: true,
          },
          fields: {
            Front: frontText,
            Back: backText,
          },
          tags: [hookName],
        },
      },
    });
    await GM.xmlHttpRequest({
      method: 'POST',
      url: 'http://localhost:8765',
      data: dataStr,
      onabort: response => ankiRequestOnFail(response, 'Request was aborted', directionCode),
      onerror: response => ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', directionCode),
      onload: (response) => {
        const result = JSON.parse(response.responseText);
        if (result.error) {
          ankiRequestOnFail(response, result.error);
          return;
        }
        ankiRequestOnSuccess(hookNode);
      },
    });
  };


  const createHook = (userdata) => {
    if (!extractFrontText || typeof extractFrontText !== 'function') {
      throw Error('Missing function extractFrontText()');
    }
    if (!extractBackText || typeof extractBackText !== 'function') {
      throw Error('Missing function extractBackText()');
    }
    const starNodeBig = document.createElement('div');
    starNodeBig.innerText = '★';
    starNodeBig.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-big';
    const starNodeSmall = document.createElement('div');
    starNodeSmall.innerText = '★';
    starNodeSmall.className = '-anki-quick-adder-hook-star -anki-quick-adder-hook-star-small';
    const textNode = document.createElement('span');
    textNode.className = '-anki-quick-adder-hook-text';
    textNode.innerText = 'Add';
    const hookNode = document.createElement('div');
    hookNode.setAttribute('name', hookName);
    hookNode.className = '-anki-quick-adder-hook';
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.onclick = (event) => {
      const frontText = extractFrontText(userdata);
      if (typeof frontText !== 'string') {
        console.error('Found', frontText);
        throw Error('Provided siteSpecificFunctions.extractFrontText() fonction did not return a string');
      }
      if (!frontText) {
        throw Error('extractFrontText() returned an empty string');
      }
      const backText = extractBackText(userdata);
      if (typeof backText !== 'string') {
        console.error('Found', backText);
        throw Error('Provided siteSpecificFunctions.extractBackText() fonction did not return a string');
      }
      if (!backText) {
        throw Error('extractBackText() returned an empty string');
      }
      const directionCode = extractDirection(userdata);
      if (typeof directionCode !== 'string') {
        console.error('Found', directionCode);
        throw Error('Provided siteSpecificFunctions.extractDirection() fonction did not return a string');
      }
      hookOnClick(hookNode, frontText, backText, directionCode);
      event.preventDefault();
      event.stopPropagation();
    };
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    return hookNode;
  };


  run(createHook);

}());
