// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Reverso
// @version      0.1
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/\w+/
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

  __$styleInject(".-anki-add-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-add-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-add-hook:hover {\n  opacity: 1;\n}\n.-anki-add-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-add-hook-added .-anki-add-hook-star-small {\n  color: green;\n}\n.-anki-add-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-add-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-add-hook-text {\n\n}\n");

  __$styleInject(".banner {\n  height: 20px;\n  font-size: 14px;\n  color: deepskyblue;\n  text-align: left;\n}\n\n.banner-language {\n\n}\n\n\n.banner-hook-name {\n  float: right;\n}\n");

  var highlightOnHookHover = (hookNode, elementsToHighlight, backgroundColor) => {
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

  // Tells if a node is a TextNode
  var isTextNode = (node) => {
    if (!node || node.nodeType === undefined) {
      throw Error(`Provided 'node' is not a DOM node; instead found '${node}'`);
    }
    return node.nodeType === 3;
  };

  const ankiDefaultStyles = {
    bottom: ['auto', '0px'],
    boxShadow: 'none',
    boxSizing: 'border-box',
    clear: 'none',
    color: 'rgb(0, 0, 0)',
    direction: ['', 'ltr'],
    flex: '0 1 auto',
    float: 'none',
    fontSize: '14px',
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


  // export remarkable style attributes to text
  var exportNodeStyleToText = (node) => {
    const nodeStyle = window.getComputedStyle(node);
    // console.log('nodeStyle:', nodeStyle);
    const styleChunks = Object.keys(ankiDefaultStyles).reduce((elements, styleKey) => {
      const propertyValue = nodeStyle[styleKey];
      const defaultValues = getStyleDefaultValues(styleKey);
      if (
        propertyValue
        && !defaultValues.includes(propertyValue)
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

  const ANKI_ADD_BUTTON_CLASS = '-anki-add-hook';

  // Recursively clone node and assign explicit style to the clone.
  // Useful when you extract a node out of its class' scope.
  const cloneNodeWithExplicitStyle = (originalNode) => {
    // console.log('originalNode:', originalNode)
    if (originalNode.nodeType === undefined) {
      throw Error(`Provided 'originalNode' is not a DOM node; instead got ${typeof originalNode}.`);
    }
    if (isTextNode(originalNode)) {
      return originalNode.cloneNode();
    }
    if (originalNode.className && originalNode.className.includes(ANKI_ADD_BUTTON_CLASS)) {
      return null; // Ignore anki button
    }
    const originalNodeStyle = window.getComputedStyle(originalNode);
    if (originalNodeStyle.display === 'none' || originalNodeStyle.opacity === '0') {
      return null; // Ignore the hidden elements
    }
    const cloneNode = originalNode.cloneNode();
    cloneNode.removeAttribute('id');
    cloneNode.removeAttribute('class');
    cloneNode.removeAttribute('name');
    cloneNode.removeAttribute('title');
    const styleText = exportNodeStyleToText(originalNode);
    cloneNode.style.cssText = styleText;
    if (originalNode.childNodes) {
      originalNode.childNodes.forEach(
        (childNode) => {
          const clonedChild = cloneNodeWithExplicitStyle(childNode);
          if (clonedChild) {
            cloneNode.append(clonedChild);
          }
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
    text
      .replace(/\s*style=""\s*/gm, ' ');
      // .replace(/\s*name=""\s*/gm, ' ')
      // .replace(/\s*class=""\s*/gm, ' ')
      // .replace(/\s*id=""\s*/gm, ' ');


  // Create a stringified html screenshot of one or several node(s), with style! 😎
  // transformTree   function     transform the node tree before stringify it.
  const stringifyNodeWithStyle = (node, transformTree = (a => a)) => {
    if (Array.isArray(node)) {
      return node.map(elt => stringifyNodeWithStyle(elt, transformTree)).join('');
    }
    const clonedTree = cloneNodeWithExplicitStyle(node);
    if (!clonedTree) {
      return '';
    }
    const transformedTree = transformTree(clonedTree);
    if (isTextNode(transformedTree)) {
      return transformedTree.textContent;
    } else {
      return removeEmptyTagAttributes(replaceAllCssColorToHexa(transformedTree.outerHTML));
    }
  };

  const cleanTreeRec = (node) => {
    if (
      (node.nodeName === 'SPAN' && !node.textContent.replace(/[ \t]/gm, ''))
      || node.nodeName === 'HR'
    ) {
      node.remove();
      return;
    }
    // Clone the array to avoid screwing the iteration when a child if removed
    Array.from(node.childNodes)
      .forEach(childNode => cleanTreeRec(childNode));
  };

  const cleanTree = (rootNode) => {
    cleanTreeRec(rootNode);
    return rootNode;
  };

  const composeFunctions = (...funs) =>
    (...args) => {
      let val = args;
      funs.forEach((fun) => {
        val = [fun(...val)];
      });
      return val[0];
    };

  /*
    <div>
      <b><h2>FirstWord</h2></b>
      <!-- Stuff -->
      <b>adj</b>
      <!-- First word translation -->
    </div>
    <div>
      <!-- First word translation -->
    </div>
    <div>
      <b>SecondWord</b>
      <!-- Stuff -->
      <b>adj</b>
      <!-- Second word translation -->
    </div>
    <div>
      <!-- Second word translation -->
    </div>

    We need to separate the first div in two, because it contains information
    for both sides of the card.
    We take up to the second <b></b> for the first div.
    The rest of the first div and the subsequent divs are part of the back of the card.
  */
  const partitionFrontAndBackInFirstDiv = (divGroup) => {
    const nodes = Array.from(divGroup[0].childNodes);
    const nodesToKeep = [];
    let bNodeSeen = 0;
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
      const node = nodes[nodeIndex];
      nodesToKeep.push(node);
      if (node.nodeName === 'B') {
        bNodeSeen++;
        if (bNodeSeen === 2) {
          return [nodesToKeep, nodes.slice(nodeIndex + 1)];
        }
      }
    }
    return [nodesToKeep, []];
  };


  const extractFrontText = (divGroup) => {
    const transformTree = composeFunctions(cleanTree);
    return stringifyNodeWithStyle(partitionFrontAndBackInFirstDiv(divGroup)[0], transformTree);
  };

  const extractBackText = (divGroup) => {
    const [, ...rest] = divGroup;
    return `<div style="text-align:left;margin:auto;display:table;">
            ${stringifyNodeWithStyle(partitionFrontAndBackInFirstDiv(divGroup)[1])}
            ${stringifyNodeWithStyle(rest, cleanTree)}
          </div>
        `;
  };


  const getDivGroup = (wordNode, nextWordNode) => {
    const divsToHighlight = [];
    if (nextWordNode) {
      let node = wordNode.parentNode;
      while (node && node !== nextWordNode.parentNode) {
        if (!isTextNode(node)) {
          divsToHighlight.push(node);
        }
        node = node.nextSibling;
      }
    } else {
      divsToHighlight.push(wordNode.parentNode);
    }
    return divsToHighlight;
  };


  const extract = divGroup => ({
    frontText: extractFrontText(divGroup),
    backText: extractBackText(divGroup),
  });

  const run = (createHook) => {
    const translateBox = document.getElementsByName('translate_box')[0];
    if (!translateBox) {
      return;
    }
    const wordNodes = translateBox.querySelectorAll('div b:first-child');
    wordNodes.forEach((wordNode, wordNodeIndex) => {
      const divGroup = getDivGroup(wordNode, wordNodes[wordNodeIndex + 1]);
      const hook = createHook({ type: 'collins', data: divGroup });
      hook.style.position = 'absolute';
      hook.style.right = '0px';
      hook.style.top = '10px';
      highlightOnHookHover(hook, divGroup, 'lightblue');
      wordNode.parentNode.style.position = 'relative';
      wordNode.parentNode.append(hook);
    });
  };

  // @name         Anki Add Hooks for Reverso


  const hookName = 'reverso.net';


  const extract$1 = ({ type, data }) => {
    let [, sourceLanguage, targetLanguage] = window.location.href.match(/reverso\.net\/([a-z]+)-([a-z]+)\//);
    let extractedData;
    if (type === 'collins') {
      extractedData = extract(data);
    } else {
      throw Error(`Unknown type '${type}'`);
    }
    const { reversedDirection, frontText, backText } = extractedData;
    if (reversedDirection) {
      const tmp = targetLanguage;
      targetLanguage = sourceLanguage;
      sourceLanguage = tmp;
    }
    return {
      frontText,
      backText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  };


  // There are weird "&nbsp;" spans with a white border-bottom, that make it
  // ugly when we put a background. So we set them to transparent instead.
  const hideNbspSpans = () => {
    document.querySelectorAll('.nbsp1').forEach((span) => {
      span.style.setProperty('border-color', 'transparent', 'important');
    });
  };


  const run$1 = (createHook) => {
    hideNbspSpans();
    run(createHook);

    // const collaborativeDefinitionsRows = Array.from(document.querySelectorAll('.CDResTable tr')).filter(tr => tr.getAttribute('valign') === 'top');
    // collaborativeDefinitionsRows.forEach((rowNode) => {
    //   const hook = createHook({ type: 'collaborativeDictionary', parentNode: rowNode });
    //   hook.style.position = 'absolute';
    //   hook.style.left = '105px';
    //   const parentNode = rowNode.querySelector('.CDResAct');
    //   parentNode.style.position = 'relative';
    //   parentNode.append(hook);
    // });
  };

  /* global GM */


  const getDeckNameMapKey = cardKind => `deckName_${cardKind.toLowerCase()}`;
  const getModelNameMapKey = cardKind => `modelName_${cardKind.toLowerCase()}`;

  const ankiRequestOnFail = async (response, message, cardKind) => {
    console.error('Anki request response:', response);
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(cardKind), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(cardKind), null);
    }
    alert(`AnkiConnect returned an error:\n${message}`);
  };


  const ankiRequestOnSuccess = (hookNode) => {
    hookNode.classList.add('-anki-add-hook-added');
    hookNode.querySelector('.-anki-add-hook-text').innerText = 'Added';
    hookNode.onclick = () => {};
  };


  const buildCardFace = (htmlContent, language, hookName$$1) => {
    const bannerContent = [
      '<style>.banner{height:20px;font-size:14px;color:deepskyblue;text-align:left;}.banner-language{}.banner-hook-name{float:right;}</style>', // Replaced at compilation by ./card_style.css
      `<div class="banner-hook-name">${hookName$$1}</div>`,
    ];
    if (language) {
      bannerContent.push(`<div class="banner-language">${language}</div>`);
    }
    return `<div class="banner">
            ${bannerContent.join('')}
          </div>
          <div style="text-align:center;width:100%;">
          ${htmlContent}
          </div>
        `;
  };


  const hookOnClick = async (
    hookNode, frontText, backText, frontLanguage, backLanguage, cardKind, hookName$$1
  ) => {
    // console.log('frontText:', frontText)
    // console.log('backText:', backText)
    // console.log('cardKind:', cardKind)
    // return
    const deckNameMapKey = getDeckNameMapKey(cardKind);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = prompt(`Enter the name of the deck you want to add '${cardKind}' cards from this website`, 'Default');
      if (!deckName) {
        return; // Cancel
      }
      GM.setValue(deckNameMapKey, deckName);
    }
    const modelNameMapKey = getModelNameMapKey(cardKind);
    let modelName = await GM.getValue(modelNameMapKey);
    if (!modelName) {
      modelName = prompt(`Enter the name of the card model you want to create for '${cardKind}'`, 'Basic (and reversed card)');
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
            Front: buildCardFace(frontText, frontLanguage, hookName$$1),
            Back: buildCardFace(backText, backLanguage, hookName$$1),
          },
          tags: [hookName],
        },
      },
    });
    await GM.xmlHttpRequest({
      method: 'POST',
      url: 'http://localhost:8765',
      data: dataStr,
      onabort: response => ankiRequestOnFail(response, 'Request was aborted', cardKind),
      onerror: response => ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', cardKind),
      onload: (response) => {
        const result = JSON.parse(response.responseText);
        if (result.error) {
          ankiRequestOnFail(response, result.error, cardKind);
          return;
        }
        ankiRequestOnSuccess(hookNode);
      },
    });
  };


  const createHook = (userdata) => {
    if (!extract$1 || typeof extract$1 !== 'function') {
      throw Error('Missing function extract()');
    }
    const starNodeBig = document.createElement('div');
    starNodeBig.innerText = '★';
    starNodeBig.className = '-anki-add-hook-star -anki-add-hook-star-big';
    const starNodeSmall = document.createElement('div');
    starNodeSmall.innerText = '★';
    starNodeSmall.className = '-anki-add-hook-star -anki-add-hook-star-small';
    const textNode = document.createElement('span');
    textNode.className = '-anki-add-hook-text';
    textNode.innerText = 'Add';
    const hookNode = document.createElement('div');
    hookNode.setAttribute('name', hookName);
    hookNode.className = ANKI_ADD_BUTTON_CLASS;
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const extractedFields = extract$1(userdata);
      if (typeof extractedFields !== 'object') {
        console.error('Found', extractedFields);
        throw Error('Provided siteSpecificFunctions.extract() fonction did not return an object');
      }
      const {
        frontText, backText, frontLanguage, backLanguage, cardKind
      } = extractedFields;
      // console.log('frontText:', frontText)
      // console.log('backText:', backText)

      if (typeof frontText !== 'string') {
        console.error('Found', frontText);
        throw Error('Provided extract().frontText is not a string');
      }
      if (!frontText) {
        throw Error('Provided extract().frontText is empty');
      }
      if (typeof backText !== 'string') {
        console.error('Found', backText);
        throw Error('Provided extract().backText is not a string');
      }
      if (!backText) {
        throw Error('Provided extract().backText is empty');
      }
      if (typeof cardKind !== 'string') {
        console.error('Found', cardKind);
        throw Error('Provided extract().cardKind is not a string');
      }
      if (!cardKind) {
        throw Error('Provided extract().cardKind is empty');
      }

      hookOnClick(
        hookNode, frontText, backText,
        frontLanguage, backLanguage,
        cardKind,
        hookName
      );
    };
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    return hookNode;
  };


  run$1(createHook);

}());
