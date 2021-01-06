// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for Reverso
// @version      2.5
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/(\w+\/)?\w+-\w+\/.+/
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

  __$styleInject(".-anki-add-hook {\r\n  -moz-user-select: none;\r\n  -ms-user-select: none;\r\n  -o-user-select: none;\r\n  -webkit-touch-callout: none;\r\n  -webkit-user-select: none;\r\n  background-color: #aaaaaa;\r\n  border-radius: 5px;\r\n  border: 2px solid #222222;\r\n  box-sizing: content-box;\r\n  color: white;\r\n  cursor: pointer;\r\n  display: inline-block;\r\n  font-family: 'Roboto', sans-serif;\r\n  font-size: 12px;\r\n  font-weight: bold;\r\n  height: 15px;\r\n  line-height: 17px;\r\n  opacity: 0.8;\r\n  overflow-wrap: normal;\r\n  overflow: hidden;\r\n  padding-left: 30px;\r\n  padding-right: 5px;\r\n  position: relative;\r\n  right: 0px;\r\n  text-align: left;\r\n  text-indent: 0;\r\n  top: 0px;\r\n  user-select: none;\r\n  vertical-align: middle;\r\n  width: 35px;\r\n  z-index: 1000;\r\n}\r\n.-anki-add-hook-added {\r\n  border: 2px solid green;\r\n  opacity: 1;\r\n  cursor: auto;\r\n  color: green;\r\n  background-color: #cccccc;\r\n}\r\n.-anki-add-hook:hover {\r\n  opacity: 1;\r\n}\r\n\r\n.-anki-add-hook-star {\r\n  display: block;\r\n  transform: rotate(-15deg);\r\n  position: absolute;\r\n}\r\n.-anki-add-hook-added .-anki-add-hook-star-small {\r\n  color: green;\r\n}\r\n.-anki-add-hook-star-big {\r\n  font-size: 40px;\r\n  color: white;\r\n  z-index: 1005;\r\n  left: -7px;\r\n  top: -1px;\r\n}\r\n.-anki-add-hook-star-small {\r\n  font-size: 25px;\r\n  color: #0099ff;\r\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\r\n  z-index: 1010;\r\n  left: 0px;\r\n  top: -1px;\r\n}\r\n\r\n.-anki-add-hook-text {\r\n  text-decoration: none !important;\r\n  font-size: 12px !important;\r\n}\r\n\r\n\r\n.-anki-add-hook-loading .-anki-add-hook-star {\r\n  animation-name: spin;\r\n  animation-duration: 2000ms;\r\n  animation-iteration-count: infinite;\r\n  animation-timing-function: linear;\r\n}\r\n\r\n@keyframes spin {\r\n    from {\r\n        transform:rotate(0deg);\r\n    }\r\n    to {\r\n        transform:rotate(360deg);\r\n    }\r\n}\r\n\r\n.-anki-add-hook-error {\r\n  border: 2px solid red;\r\n  opacity: 1;\r\n  color: red;\r\n  background-color: #cccccc;\r\n}\r\n.-anki-add-hook-error .-anki-add-hook-star-small {\r\n  color: red;\r\n}\r\n");

  __$styleInject(".banner {\r\n  height: 20px;\r\n  font-size: 14px;\r\n  color: deepskyblue;\r\n  text-align: left;\r\n}\r\n\r\n.banner-language {\r\n\r\n}\r\n\r\n\r\n.banner-hook-name {\r\n  float: right;\r\n}\r\n");

  // Highlight `elementsToHighlight` with `backgroundColor` when the user hovers the hook `hookNode`.
  var highlightOnHookHover = (hookNode, elementsToHighlight, backgroundColor) => {
    if (elementsToHighlight.forEach) {
      hookNode.onmouseover = () => {
        elementsToHighlight.forEach((elt) => {
          if (elt.style !== undefined) {
            elt.style.background = backgroundColor;
          }
        });
      };
      hookNode.onmouseout = () => {
        elementsToHighlight.forEach((elt) => {
          if (elt.style !== undefined) {
            elt.style.background = null;
          }
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
  var exportNodeStyleToText = (node) => {
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

  const ANKI_ADD_BUTTON_CLASS = '-anki-add-hook';
  const ANKI_HOOK_BUTTON_LOADING_CLASS = '-anki-add-hook-loading';
  const ANKI_HOOK_BUTTON_ERROR_CLASS = '-anki-add-hook-error';
  const ANKI_HOOK_BUTTON_ADDED_CLASS = '-anki-add-hook-added';
  const ANKI_HOOK_BUTTON_TEXT_CLASS = '-anki-add-hook-text';
  const ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR = `.${ANKI_HOOK_BUTTON_TEXT_CLASS}`;

  const allowedAttributes = ['style', 'colspan', 'rowspan'];


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
    if (cloneNode.getAttributeNames) {
      cloneNode.getAttributeNames().forEach((attrName) => {
        if (!allowedAttributes.includes(attrName)) {
          cloneNode.removeAttribute(attrName);
        }
      });
    }
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

  var ScrapingError = (message) => {
    const error = Error(message);
    error.name = 'ScrapingError';
    error.location = window.location;
    error.stack = error.stack.split(/[\n\r]/gm).slice(4).join('\n');
    return error;
  };

  let allIds = null;

  // Return the list of nodes with an id matching the provided pattern
  const getNodesWithIdMatchingRegExp = (pattern, { throwOnUnfound = true } = {}) => {
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
  const getNodeWithIdMatchingRegExp = (
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
  const querySelectorAll = (parentNode, selector, options = {}) => {
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
  const querySelector = (
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
  const getElementsByName = (parentNode, name, options = {}) => {
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

  var getLanguages = () => {
    const match = window.location.href.match(/reverso\.net\/(\w+\/)?([a-z]+)-([a-z]+)\//);
    if (!match) {
      throw ScrapingError('Could not extract languages from url');
    }
    const [,, sourceLanguage, targetLanguage] = match;
    if (!sourceLanguage || !targetLanguage) {
      throw ScrapingError('Could not extract languages from url');
    }
    return [sourceLanguage, targetLanguage];
  };

  // composeFunction(f, g, h) =>
  //   x => (f∘g∘h)(x)


  var composeFunctions = (...funs) =>
    (...args) => {
      let val = args;
      funs.forEach((fun) => {
        val = [fun(...val)];
      });
      return val[0];
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


  var runOnCollinsDictionary = (createHook) => {
    getElementsByName(document, 'translate_box', { throwOnUnfound: false })
      .forEach((translateBox) => {
        const wordNodes = querySelectorAll(translateBox, 'div > b:first-child', { throwOnUnfound: false });
        wordNodes.forEach((wordNode, wordNodeIndex) => {
          const divGroup = getDivGroup(wordNode, wordNodes[wordNodeIndex + 1]);
          const hook = createHook(() => {
            const [sourceLanguage, targetLanguage] = getLanguages();
            return {
              frontText: extractFrontText(divGroup),
              backText: extractBackText(divGroup),
              frontLanguage: sourceLanguage,
              backLanguage: targetLanguage,
              cardKind: `${sourceLanguage} -> ${targetLanguage}`,
            };
          });
          hook.style.position = 'absolute';
          hook.style.right = '0px';
          hook.style.top = '10px';
          highlightOnHookHover(hook, divGroup, 'lightblue');
          wordNode.parentNode.style.position = 'relative';
          wordNode.parentNode.append(hook);
        });
      });
  };

  const extractFrontText$1 = () => {
    const sourceWord = getNodeWithIdMatchingRegExp(/_lblEntry$/);
    return stringifyNodeWithStyle(sourceWord);
  };

  const extractBackText$1 = () => {
    const targetWord = getNodeWithIdMatchingRegExp(/_lblTranslation$/);
    return stringifyNodeWithStyle(targetWord);
  };


  var runOnMainDictionary = (createHook) => {
    const resultBox = querySelector(document, '.center_frameColl', { throwOnUnfound: false });
    if (!resultBox) {
      return;
    }
    const hook = createHook(() => {
      const [sourceLanguage, targetLanguage] = getLanguages();
      return {
        frontText: extractFrontText$1(),
        backText: extractBackText$1(),
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    });
    hook.style.position = 'absolute';
    hook.style.right = '100px';
    hook.style.top = '5px';
    highlightOnHookHover(hook, resultBox, 'lightblue');
    resultBox.style.position = 'relative';
    resultBox.append(hook);
  };

  const extractFrontText$2 = row =>
    stringifyNodeWithStyle(querySelector(row, '.CDResSource'));

  const extractBackText$2 = row =>
    stringifyNodeWithStyle(querySelector(row, '.CDResTarget'));


  const extractCallBack = (row, reverseDirection) => {
    let sourceLanguage;
    let targetLanguage;
    if (reverseDirection) {
      [targetLanguage, sourceLanguage] = getLanguages();
    } else {
      [sourceLanguage, targetLanguage] = getLanguages();
    }
    return {
      frontText: extractFrontText$2(row),
      backText: extractBackText$2(row),
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  };


  var runOnCollaborativeDictionary = (createHook) => {
    const allRows = querySelectorAll(document, '.CDResTable tr', { throwOnUnfound: false });
    const reverseDirectionRows = querySelectorAll(
      document,
      '#ctl00_cC_ucResPM_opossiteEntries tr',
      { throwOnUnfound: false }
    )
      .filter(tr => tr.getAttribute('valign') === 'top');
    const normalRows = allRows.filter(tr => !reverseDirectionRows.includes(tr))
      .filter(tr => tr.getAttribute('valign') === 'top');
    [
      { rows: normalRows, reverseDirection: false },
      { rows: reverseDirectionRows, reverseDirection: true }
    ]
      .forEach(({ rows, reverseDirection }) => {
        rows.forEach((row) => {
          const hook = createHook(() => extractCallBack(row, reverseDirection));
          hook.style.position = 'absolute';
          hook.style.left = '105px';
          highlightOnHookHover(hook, row, 'lightblue');
          const parentNode = querySelector(row, '.CDResAct');
          parentNode.style.position = 'relative';
          parentNode.append(hook);
        });
      });
  };

  // e.g. https://dictionnaire.reverso.net/francais-anglais/hello
  //        Table on the bottom with a few examples.

  const extractFrontText$3 = trNode =>
    stringifyNodeWithStyle(querySelector(trNode, 'td.src'));

  const extractBackText$3 = trNode =>
    stringifyNodeWithStyle(querySelector(trNode, 'td.tgt'));


  var runOnDictionaryContextualDictionary = (createHook) => {
    querySelectorAll(document, '#ctxBody tr', { throwOnUnfound: false })
      .filter(
        trNode =>
          // The first row is often empty, we take only those with a td.src inside
          querySelector(trNode, 'td.src', { throwOnUnfound: false })
      )
      .forEach((trNode) => {
        const hook = createHook(() => {
          const [sourceLanguage, targetLanguage] = getLanguages();
          return {
            frontText: extractFrontText$3(trNode),
            backText: extractBackText$3(trNode),
            frontLanguage: sourceLanguage,
            backLanguage: targetLanguage,
            cardKind: `${sourceLanguage} -> ${targetLanguage}`,
          };
        });
        hook.style.position = 'absolute';
        hook.style.top = '3px';
        hook.style.right = '-80px';
        highlightOnHookHover(hook, trNode, 'lightblue');
        const parentNode = querySelector(trNode, 'td:last-child');
        parentNode.style.position = 'relative';
        parentNode.append(hook);
      });
  };

  // e.g. https://context.reverso.net/traduction/anglais-francais/hello

  const extractFrontText$4 = containerDiv =>
    stringifyNodeWithStyle(querySelector(containerDiv, '.src > .text'));

  const extractBackText$4 = containerDiv =>
    stringifyNodeWithStyle(querySelector(containerDiv, '.trg > .text'));


  var runOnContextReverso = (createHook) => {
    querySelectorAll(document, '.example', { throwOnUnfound: false })
      .forEach((containerDiv) => {
        const hook = createHook(() => {
          const [sourceLanguage, targetLanguage] = getLanguages();
          return {
            frontText: extractFrontText$4(containerDiv),
            backText: extractBackText$4(containerDiv),
            frontLanguage: sourceLanguage,
            backLanguage: targetLanguage,
            cardKind: `${sourceLanguage} -> ${targetLanguage}`,
          };
        });
        hook.style.float = 'right';
        highlightOnHookHover(hook, containerDiv, 'lightblue');
        containerDiv.style.position = 'relative';
        containerDiv.querySelector('.options .trg').prepend(hook);
      });
  };

  // @name         Anki Add Hooks for Reverso


  const hookName = 'reverso.net';


  // There are weird "&nbsp;" spans with a white border-bottom, that make it
  // ugly when we put a background. So we set them to transparent instead.
  const hideNbspSpans = () => {
    querySelectorAll(document, '.nbsp1', { throwOnUnfound: false }).forEach((span) => {
      span.style.setProperty('border-color', 'transparent', 'important');
    });
  };


  const run = (createHook) => {
    hideNbspSpans();
    runOnContextReverso(createHook);
    runOnCollinsDictionary(createHook);
    runOnMainDictionary(createHook);
    runOnCollaborativeDictionary(createHook);
    runOnDictionaryContextualDictionary(createHook);
  };

  var onScrapingError = (error) => {
    const productionExtraMessage = `
    Please report the following infos at:
    https://github.com/OoDeLally/anki-add-hooks-userscripts/issues`;
    console.error(
      `AnkiAddHooks: Error during web page scraping. ${
      productionExtraMessage
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: 2.3.0.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 2.5.
    `
    );
    {
      alert(`AnkiAddHooks Error
          There was an error in reading the web page.
          You can help us solve it:
          1- Open the console (F12 key => tab "Console").
          2- Close this popup.
          3- Copy the error message from the console.
          3- Paste the error message in a github issue at the url mentioned in the error message.
          Thank you.
    `);
    }
  };

  const AnkiConnectError = (message, response) => {
    const error = Error(message);
    error.name = 'AnkiConnectError';
    error.response = response;
    return error;
  };

  const CancelledError = (message = null) => {
    const error = Error(message);
    error.name = 'CancelledError';
    return error;
  };


  const getDeckNameMapKey = cardKind => `deckName_${cardKind.toLowerCase()}`;
  const getModelNameMapKey = cardKind => `modelName_${cardKind.toLowerCase()}`;


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


  const ankiConnectRequest = (action, params) =>
    new Promise(
      async (resolve, reject) =>
        GM.xmlHttpRequest({
          method: 'POST',
          url: 'http://localhost:8765',
          data: JSON.stringify({ action, version: 6, params }),
          onabort: (response) => {
            console.error(response);
            reject(AnkiConnectError('Request was aborted'));
          },
          onerror: (response) => {
            console.error(response);
            reject(AnkiConnectError(
              `Could not connect to Anki Desktop. Please make sure that:
    - Anki Desktop is running.
    - AnkiConnect add-on is installed on Anki Desktop.
    - Anki Desktop was restarted after installing AnkiConnect add-on.`
            ));
          },
          onload: (response) => {
            const reponseJson = JSON.parse(response.responseText);
            if (reponseJson.error) {
              reject(AnkiConnectError(reponseJson.error));
              return;
            }
            resolve(reponseJson.result);
          },
        })
    );

  const ankiConnectGetDecksRequest = async () =>
    ankiConnectRequest('deckNames');

  const ankiConnectGetModelsRequest = async () =>
    ankiConnectRequest('modelNames');

  const ankiConnectGetModelFieldNamesRequest = async modelName =>
    ankiConnectRequest('modelFieldNames', { modelName });


  const promptDeckList = async (cardKind) => {
    const availableDecks = await ankiConnectGetDecksRequest();
    if (availableDecks.length === 0) {
      throw AnkiConnectError('No deck are available. Please create one on Anki first.');
    }
    if (availableDecks.length === 1) {
      return availableDecks[0];
    }
    let chosenDeckIndex = null;
    while (chosenDeckIndex === null) {
      const chosenDeckIndexStr = prompt(
        `Adding card of type:\n       [ ${cardKind} ]\n`
        + `${availableDecks.length} decks have been found on your Anki account:\n`
        + `${availableDecks.map((deckName, deckIndex) => `        ${deckIndex + 1} - ${deckName}\n`).join('')}`
        + 'Enter the index (e.g. "1") of the deck you want:'
      );
      if (chosenDeckIndexStr == null) {
        throw CancelledError();
      }
      const index = parseInt(chosenDeckIndexStr, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= availableDecks.length) {
        chosenDeckIndex = index - 1;
      }
    }
    return availableDecks[chosenDeckIndex];
  };


  // Associate a deck to the kind of card
  const getDeckName = async (cardKind) => {
    const deckNameMapKey = getDeckNameMapKey(cardKind);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = await promptDeckList(cardKind);
      GM.setValue(deckNameMapKey, deckName);
    }
    return deckName;
  };


  const promptModelList = async (cardKind) => {
    const availableModels = await ankiConnectGetModelsRequest();
    if (availableModels.length === 0) {
      throw AnkiConnectError('No model are available. Please create one on Anki first.');
    }
    if (availableModels.length === 1) {
      return availableModels[0];
    }
    let choseModelIndex = null;
    while (choseModelIndex === null) {
      const choseModelIndexStr = prompt(
        `Adding card of type:\n       [ ${cardKind} ]\n`
        + `${availableModels.length} models have been found on your Anki account:\n`
        + `${availableModels.map((modelName, modelIndex) => `        ${modelIndex + 1} - ${modelName}\n`).join('')}`
        + 'Enter the index (e.g. "1") of the model you want:'
      );
      if (choseModelIndexStr == null) {
        throw CancelledError();
      }
      const index = parseInt(choseModelIndexStr, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= availableModels.length) {
        choseModelIndex = index - 1;
      }
    }
    return availableModels[choseModelIndex];
  };


  // Associate a card model to the kind of card
  const getModelName = async (cardKind) => {
    const modelNameMapKey = getModelNameMapKey(cardKind);
    let modelName = await GM.getValue(modelNameMapKey);
    if (!modelName) {
      modelName = await promptModelList(cardKind);
      if (!modelName) {
        throw CancelledError();
      }
      await GM.setValue(modelNameMapKey, modelName);
    }
    return modelName;
  };


  const ankiConnectAddNoteRequest = async (fields) => {
    const deckName = await getDeckName(fields.cardKind);
    const modelName = await getModelName(fields.cardKind);
    const modelFields = await ankiConnectGetModelFieldNamesRequest(modelName);
    if (modelFields.length !== 2) {
      throw AnkiConnectError(
        `Your model [ ${modelName} ] uses ${modelFields.length} fields: ${modelFields.map(field => `[ ${field} ]`).join(', ')}.\n`
        + 'Please use a model with exactly two fields.'
      );
    }
    return ankiConnectRequest('addNote', {
      note: {
        deckName,
        modelName,
        options: {
          allowDuplicate: true,
        },
        fields: {
          [modelFields[0]]: buildCardFace(
            fields.frontText,
            fields.frontLanguage,
            hookName
          ),
          [modelFields[1]]: buildCardFace(
            fields.backText,
            fields.backLanguage,
            hookName
          ),
        },
        tags: [hookName],
      },
    });
  };


  const ankiAddNoteRequestOnFail = async (message, cardKind) => {
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(cardKind), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(cardKind), null);
    }
    alert(message);
  };


  const ankiAddNoteRequestOnSuccess = (hookNode) => {
    hookNode.onclick = () => {};
  };


  const wait = async ms => new Promise(resolve => setTimeout(resolve, ms));

  const updateButtonState = async (hook, state) => {
    if (state === 'available') {
      hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
      hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Add';
    } else if (state === 'loading') {
      hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
      hook.classList.add(ANKI_HOOK_BUTTON_LOADING_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
      hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Add';
    } else if (state === 'added') {
      hook.classList.add(ANKI_HOOK_BUTTON_ADDED_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_ERROR_CLASS);
      hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Added';
    } else if (state === 'error') {
      hook.classList.remove(ANKI_HOOK_BUTTON_ADDED_CLASS);
      hook.classList.add(ANKI_HOOK_BUTTON_ERROR_CLASS);
      hook.classList.remove(ANKI_HOOK_BUTTON_LOADING_CLASS);
      hook.querySelector(ANKI_HOOK_BUTTON_TEXT_CLASS_SELECTOR).innerText = 'Error';
    } else {
      throw Error(`Unknwown state ${state}`);
    }
    await wait(100); // Leave time for the button style to be updated
  };


  const verifyExtractedFields = (extractedFields) => {
    if (typeof extractedFields !== 'object') {
      console.error('Found', extractedFields);
      throw Error('extractCallback() should have returned an object');
    }
    const {
      frontText, backText, cardKind
    } = extractedFields;

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
    return extractedFields;
  };


  const onHookClick = async (event, extractFieldsCallback, hookNode) => {
    event.preventDefault();
    event.stopPropagation();
    let fields;
    try {
      fields = verifyExtractedFields(extractFieldsCallback());
      await updateButtonState(hookNode, 'loading');
      await ankiConnectAddNoteRequest(fields);
      await updateButtonState(hookNode, 'added');
      ankiAddNoteRequestOnSuccess(hookNode);
    } catch (error) {
      if (error.name === 'ScrapingError') {
        await updateButtonState(hookNode, 'error');
        onScrapingError(error);
      } else if (error.name === 'AnkiConnectError') {
        await updateButtonState(hookNode, 'error');
        ankiAddNoteRequestOnFail(error.message, fields.cardKind);
      } else if (error.name === 'CancelledError') {
        await updateButtonState(hookNode, 'available');
        return; // Cancelled by user.
      } else {
        await updateButtonState(hookNode, 'error');
        throw error;
      }
    }
  };


  const createHook = (extractFieldsCallback) => {
    if (!extractFieldsCallback || typeof extractFieldsCallback !== 'function') {
      throw Error('createHook() must be provided a extraction function');
    }
    const starNodeBig = document.createElement('div');
    starNodeBig.innerText = '★';
    starNodeBig.className = '-anki-add-hook-star -anki-add-hook-star-big';
    const starNodeSmall = document.createElement('div');
    starNodeSmall.innerText = '★';
    starNodeSmall.className = '-anki-add-hook-star -anki-add-hook-star-small';
    const textNode = document.createElement('span');
    textNode.className = ANKI_HOOK_BUTTON_TEXT_CLASS;
    textNode.innerText = 'Add';
    const hookNode = document.createElement('div');
    hookNode.setAttribute('name', hookName);
    hookNode.className = ANKI_ADD_BUTTON_CLASS;
    hookNode.title = 'Create an Anki card from this translation';
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    hookNode.onclick = event => onHookClick(event, extractFieldsCallback, hookNode);
    return hookNode;
  };


  try {
    run(createHook);
  } catch (error) {
    if (error.name === 'ScrapingError') {
      onScrapingError(error);
    } else {
      throw error;
    }
  }

}());
