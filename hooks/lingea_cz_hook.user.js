// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for lingea.cz
// @version      2.3
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/.+/
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

  __$styleInject(".-anki-add-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.8;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-add-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: green;\n  background-color: #cccccc;\n}\n.-anki-add-hook:hover {\n  opacity: 1;\n}\n\n.-anki-add-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-add-hook-added .-anki-add-hook-star-small {\n  color: green;\n}\n.-anki-add-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-add-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-add-hook-text {\n  text-decoration: none !important;\n  font-size: 12px !important;\n}\n\n\n.-anki-add-hook-loading .-anki-add-hook-star {\n  animation-name: spin;\n  animation-duration: 2000ms;\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n}\n\n@keyframes spin {\n    from {\n        transform:rotate(0deg);\n    }\n    to {\n        transform:rotate(360deg);\n    }\n}\n\n.-anki-add-hook-error {\n  border: 2px solid red;\n  opacity: 1;\n  color: red;\n  background-color: #cccccc;\n}\n.-anki-add-hook-error .-anki-add-hook-star-small {\n  color: red;\n}\n");

  __$styleInject(".banner {\n  height: 20px;\n  font-size: 14px;\n  color: deepskyblue;\n  text-align: left;\n}\n\n.banner-language {\n\n}\n\n\n.banner-hook-name {\n  float: right;\n}\n");

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
  const ANKI_ADD_BUTTON_CLASS_SELECTOR = `.${ANKI_ADD_BUTTON_CLASS}`;
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


  // Tells if `parentNode` already contains an anki hook.
  // `parentNode` can be an array of nodes to look from.
  const doesAnkiHookExistIn = parentNode =>
    !!querySelector(
      parentNode,
      ANKI_ADD_BUTTON_CLASS_SELECTOR,
      { throwOnUnfound: false }
    );

  var extractCardKind = () => {
    const match = window.location.href.match(/lingea\.cz\/(\w+-\w+)\//);
    if (!match) {
      throw Error('Failed to extract direction');
    }
    return match[1];
  };

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

  // Highlight `elementsToHighlight` with `backgroundColor` when the user hovers the hook `hookNode`.
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

  const findFirstAncestor = (node, ancestorPredicate) => {
    const { parentNode } = node;
    if (!parentNode) {
      return null;
    }
    if (ancestorPredicate(parentNode)) {
      return parentNode;
    }
    return findFirstAncestor(parentNode, ancestorPredicate);
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

  const dropFrontTextJunk = (node) => {
    const childNodesToRemove = [];
    node.childNodes.forEach((childNode) => {
      if (
        // childNode.nodeName === 'SUP' // e.g. "do¹"
        // ||
        childNode.nodeValue === '*' // e.g. "do*"
      ) {
        childNodesToRemove.push(childNode);
      }
    });
    childNodesToRemove.forEach(childNode => childNode.remove());
    return node;
  };


  const extractFrontText = (headerNodes) => {
    const hmtl = headerNodes
      .map(headerNode => stringifyNodeWithStyle(headerNode, dropFrontTextJunk))
      .join('<br/>');
    return `<div style="display:table;margin:auto;text-align:left;">${hmtl}</div>`;
  };


  const getWordToSubstitute = (headerNode) => {
    const h1 = querySelector(headerNode, '.lex_ful_entr', { throwOnUnfound: false });
    if (!h1) {
      return null;
    }
    const word = h1.childNodes[0].textContent.split(/[-. ]/)[0];
    if (!word) {
      throw ScrapingError('Could not find word to substitute');
    }
    return word;
  };


  // Replace ${wordToSubstitute} by `[.....]` in every node of `rootNode` tree.
  // This is use to give away the front side in the backside.
  const replaceWordOccurencesByWildcard = (rootNode, wordToSubstitute) => {
    const regexp = new RegExp(`\\b${wordToSubstitute}\\b`, 'igm');
    const substitute = `[${[...Array(wordToSubstitute.length - 1)].map(() => '.').join('')}]`;
    const replaceRec = (node) => {
      node.childNodes.forEach((childNode) => {
        if (isTextNode(childNode)) {
          childNode.textContent = childNode.textContent.replace(regexp, substitute);
        } else {
          replaceRec(childNode);
        }
      });
      return node;
    };
    replaceRec(rootNode);
  };


  const replaceWordsOccurencesByWildcards = wordsToSubstitute =>
    (node) => {
      wordsToSubstitute.forEach(word => replaceWordOccurencesByWildcard(node, word));
      return node;
    };


  const extractBackText = (headerNodes, backSideTrs) => {
    const translationRows = backSideTrs
      .filter(tr => !tr.className || !tr.className.includes('head'));
    const wordsToSubstitute = headerNodes.map(getWordToSubstitute).filter(w => w);
    const definitionText = translationRows.map(
      tr =>
        stringifyNodeWithStyle(
          tr,
          composeFunctions(dropWTags, replaceWordsOccurencesByWildcards(wordsToSubstitute))
        )
    ).join('');
    return `<table style="text-align:left;margin:auto;">${definitionText}</table>`;
  };


  const extractCallback = (headerNodes, backSideTrs) => ({
    frontText: extractFrontText(headerNodes),
    backText: extractBackText(headerNodes, backSideTrs),
    frontLanguage: null,
    backLanguage: null,
    cardKind: `${extractCardKind()} Main Term`,
  });


  // Some words have only one nature. e.g. `hrabat` can only be a verb.
  const runOnSingleNature = (headerNodes, createHook) => {
    const parentNode = headerNodes[0];
    if (doesAnkiHookExistIn(parentNode)) {
      return;
    }
    const backSideTrs = querySelectorAll(document, '.entry tr');
    const hook = createHook(() => extractCallback(headerNodes, backSideTrs));
    hook.style.position = 'absolute';
    hook.style.right = '0px';
    const mainPanel = querySelectorAll(document, '.entry');
    highlightOnHookHover(hook, mainPanel, 'lightblue');
    parentNode.appendChild(hook);
  };


  // Some words can have several natures. e.g. `land` is both an verb, a noun and an adjective.
  const runOnMultipleNatures = (headerNodes, firstTrs, createHook) => {
    // For each firstTr, we take every tr until the next one:
    // <table>
    //   <tr>nature 0 - firstTr</tr>
    //   <tr>nature 0 - def 0</tr>
    //   <tr>nature 0 - def 1</tr>
    //   <tr>nature 0 - def 2</tr>
    //   <tr>nature 1 - firstTr</tr>
    //   <tr>nature 1 - def 0</tr>
    //   <tr>nature 2 - firstTr</tr>
    //   <tr>nature 2 - def 0</tr>
    //   <tr>nature 2 - def 1</tr>
    //   <tr>nature 2 - def 1</tr>
    // <table>
    firstTrs.forEach((firstTr, firstTrIndex) => {
      if (doesAnkiHookExistIn(firstTr)) {
        return;
      }
      if (firstTr.innerText === 'phr') {
        return; // phrase example. Those are handled differently by another function.
      }
      const nextFirstTr = firstTrs[firstTrIndex + 1];
      const backSideTrs = [];
      let currentTr = firstTr;
      do {
        backSideTrs.push(currentTr);
        currentTr = currentTr.nextSibling;
      } while (currentTr && currentTr !== nextFirstTr);
      const hook = createHook(() => extractCallback([...headerNodes, firstTr], backSideTrs));
      hook.style.position = 'absolute';
      hook.style.right = '0px';
      highlightOnHookHover(hook, [...backSideTrs, ...headerNodes], 'lightblue');
      const parentNode = querySelector(firstTr, 'td:last-child');
      parentNode.style.position = 'relative';
      parentNode.appendChild(hook);
    });
  };


  var runOnMainPanel = (createHook) => {
    // Sometimes there will be several headerNodes e.g. when searching for `rozlétly`.
    // In such case we only put the button to the first row.
    const headerNodes = querySelectorAll(document, '.entry  tr.head td', { throwOnUnfound: false });
    if (headerNodes.length === 0) {
      return; // Word was not found, or error 505, or captcha
    }

    const termNatureNodes = querySelectorAll(document, 'td:first-child .lex_ful_morf:first-child', { throwOnUnfound: false });
    // Whether the word has several natures or just one, the layout is different.
    if (termNatureNodes.length > 0) {
      runOnMultipleNatures(
        headerNodes,
        termNatureNodes.map(termNatureNode => findFirstAncestor(termNatureNode, node => node.nodeName === 'TR')),
        createHook
      );
    }
    // Nature `phr` doesnt count since it is usually just a idiom using the word in question
    if (termNatureNodes.filter(node => node.innerText !== 'phr').length === 0) {
      runOnSingleNature(headerNodes, createHook);
    }
  };

  const replaceCommaByLinebreak = (node) => {
    node.childNodes.forEach((childNode) => {
      if (isTextNode(childNode) && childNode.nodeValue === ', ') {
        childNode.replaceWith(document.createElement('BR'));
      }
      return replaceCommaByLinebreak(childNode);
    });
    return node;
  };

  const showHookOnZoneHover = (hookNode, zoneNode) => {
    zoneNode.onmouseover = () => {
      hookNode.style.opacity = 1;
    };
    zoneNode.onmouseout = () => {
      hookNode.style.opacity = 0;
    };
  };


  // Hide the hook by default, and show it when the user hovers `zoneNodes`.
  var showHookOnZoneHover$1 = (hookNode, zoneNodes) => {
    hookNode.style.opacity = 0;
    if (zoneNodes.forEach) {
      zoneNodes.forEach(zoneNode => showHookOnZoneHover(hookNode, zoneNode));
    } else {
      showHookOnZoneHover(hookNode, zoneNodes);
    }
  };

  const runOnTd = (titleSpanNode, createHook) => {
    const parentTdNode = findFirstAncestor(titleSpanNode, node => node.nodeName === 'TD');
    if (!parentTdNode) {
      throw ScrapingError('Could not find parent TD of .lex_ful_phrs');
    }
    if (doesAnkiHookExistIn(parentTdNode)) {
      return;
    }
    const translationSpanNode = querySelector(parentTdNode, '.lex_ful_tran');

    const frontElementsHtml = [
      stringifyNodeWithStyle(
        titleSpanNode,
        dropWTags
      )
    ];
    const backElementsHtml = [
      stringifyNodeWithStyle(
        translationSpanNode,
        composeFunctions(dropWTags, replaceCommaByLinebreak)
      )
    ];

    // Sample phrases?
    querySelectorAll(parentTdNode, '.lex_ful_samp2', { throwOnUnfound: false })
      .forEach((sampleNode) => {
        frontElementsHtml.push('<br/><br/>');
        frontElementsHtml.push(
          stringifyNodeWithStyle(
            querySelector(sampleNode, '.lex_ful_samp2s'),
            dropWTags
          )
        );
        backElementsHtml.push('<br/><br/>');
        backElementsHtml.push(
          stringifyNodeWithStyle(
            querySelector(sampleNode, '.lex_ful_samp2t'),
            dropWTags
          )
        );
      });

    const hook = createHook(() => ({
      frontText: frontElementsHtml.join(''),
      backText: backElementsHtml.join(''),
      frontLanguage: null,
      backLanguage: null,
      cardKind: `${extractCardKind()} Secondary Term`,
    }));
    hook.style.position = 'absolute';
    hook.style.right = '0px';
    highlightOnHookHover(hook, parentTdNode, 'lightblue');
    showHookOnZoneHover$1(hook, parentTdNode);
    parentTdNode.style.position = 'relative';
    parentTdNode.prepend(hook);
  };


  var runOnSecondaryPanel = (createHook) => {
    querySelectorAll(document, '.lex_ful_phrs', { throwOnUnfound: false })
      .forEach(titleSpanNode => runOnTd(titleSpanNode, createHook));
  };

  const runOnRowNode = (rowNode, createHook) => {
    if (doesAnkiHookExistIn(rowNode)) {
      return;
    }
    const hook = createHook(() => ({
      frontText: stringifyNodeWithStyle(querySelector(rowNode, '.lex_ftx_samp2s'), dropWTags),
      backText: stringifyNodeWithStyle(querySelector(rowNode, '.lex_ftx_samp2t'), dropWTags),
      frontLanguage: null,
      backLanguage: null,
      cardKind: `${extractCardKind()} Contextual`,
    }));
    hook.style.position = 'absolute';
    hook.style.right = '-70px';
    const parentNode = querySelector(rowNode, 'td:last-child');
    highlightOnHookHover(hook, rowNode, 'lightblue');
    showHookOnZoneHover$1(hook, rowNode);
    parentNode.style.position = 'relative';
    parentNode.prepend(hook);
  };


  var runOnContextPanel = (createHook) => {
    querySelectorAll(document, '.fulltext tr', { throwOnUnfound: false })
      .forEach(rowNode => runOnRowNode(rowNode, createHook));
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

     Hook Template Version: 2.1.0.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 2.3.

     Stack: ${error.stack}
    `
    );
    {
      alert(`AnkiAddHooks Error
          There was an error in reading the web page.
          You can help us solve it:
          1- Open the console (F12 key => tab "Console").
          2- Copy the error message.
          3- Paste the error message in a github issue at the url mentioned in the error message.
          Thank you.
    `);
    }
  };

  // Periodically try to run runCallback(). Stops if an error is thrown.
  var periodicallyTry = (runCallback, periodInMs = 500) => {
    const timerId = setInterval(() => {
      try {
        runCallback();
      } catch (error) {
        if (error.name === 'ScrapingError') {
          clearInterval(timerId);
          const [, ...stackLines] = error.stack.split('\n');
          error.stack = stackLines.join('\n');
          onScrapingError(error);
        } else {
          throw error;
        }
      }
    }, periodInMs);
  };

  // @name         Anki Add Hooks for lingea.cz

  const hookName = 'lingea.cz';

  const run = (createHook) => {
    periodicallyTry(() => {
      runOnMainPanel(createHook);
      runOnSecondaryPanel(createHook);
      runOnContextPanel(createHook);
    });
  };

  const AnkiCardAddingError = (message, response) => {
    const error = Error(message);
    error.name = 'AnkiCardAddingError';
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


  // Associate a deck to the kind of card
  const getDeckName = async (cardKind) => {
    const deckNameMapKey = getDeckNameMapKey(cardKind);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = prompt(`Enter the name of the deck you want to add '${cardKind}' cards from this website`, 'Default');
      if (!deckName) {
        throw CancelledError();
      }
      GM.setValue(deckNameMapKey, deckName);
    }
    return deckName;
  };

  // Associate a card model to the kind of card
  const getModelName = async (cardKind) => {
    const modelNameMapKey = getModelNameMapKey(cardKind);
    let modelName = await GM.getValue(modelNameMapKey);
    if (!modelName) {
      modelName = prompt(`Enter the name of the card model you want to create for '${cardKind}'`, 'Basic (and reversed card)');
      if (!modelName) {
        throw CancelledError();
      }
      await GM.setValue(modelNameMapKey, modelName);
    }
    return modelName;
  };


  const ankiRequestOnFail = async (message, cardKind) => {
    console.error(message);
    if (message.includes('deck was not found')) {
      await GM.setValue(getDeckNameMapKey(cardKind), null);
    }
    if (message.includes('model was not found')) {
      await GM.setValue(getModelNameMapKey(cardKind), null);
    }
    alert(message);
  };


  const ankiRequestOnSuccess = (hookNode) => {
    hookNode.onclick = () => {};
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
            reject(AnkiCardAddingError('Request was aborted'));
          },
          onerror: (response) => {
            console.error(response);
            reject(AnkiCardAddingError(
              `Could not connect to Anki Desktop. Please make sure that:
    - Anki Desktop is running.
    - AnkiConnect add-on is installed on Anki Desktop.
    - Anki Desktop was restarted after installing AnkiConnect add-on.`
            ));
          },
          onload: (response) => {
            const result = JSON.parse(response.responseText);
            if (result.error) {
              reject(AnkiCardAddingError(result.error));
              return;
            }
            resolve(response.responseText);
          },
        })
    );


  const ankiConnectAddRequest = async fields =>
    ankiConnectRequest('addNote', {
      note: {
        deckName: await getDeckName(fields.cardKind),
        modelName: await getModelName(fields.cardKind),
        options: {
          allowDuplicate: true,
        },
        fields: {
          Front: buildCardFace(
            fields.frontText,
            fields.frontLanguage,
            hookName
          ),
          Back: buildCardFace(
            fields.backText,
            fields.backLanguage,
            hookName
          ),
        },
        tags: [hookName],
      },
    });


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
      await ankiConnectAddRequest(fields);
      await updateButtonState(hookNode, 'added');
      ankiRequestOnSuccess(hookNode);
    } catch (error) {
      if (error.name === 'ScrapingError') {
        await updateButtonState(hookNode, 'error');
        onScrapingError(error);
      } else if (error.name === 'AnkiCardAddingError') {
        await updateButtonState(hookNode, 'error');
        ankiRequestOnFail(error.message, fields.cardKind);
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
      handleScrapingError(error);
    } else {
      throw error;
    }
  }

}());
