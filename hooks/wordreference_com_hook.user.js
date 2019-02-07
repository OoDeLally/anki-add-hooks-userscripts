// ==UserScript==
// @namespace    https://github.com/OoDeLally/anki-add-hooks-userscripts
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for WordReference.com
// @version      0.1
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/
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

  // Tells if a node is a TextNode
  var isTextNode = node => node.nodeType === 3;

  const ankiDefaultStyles = {
    bottom: ['auto', '0px'],
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
  const cloneNodeWithExplicitStyle = (node) => {
    if (node.nodeType === undefined) {
      throw Error(`Provided 'node' is not a DOM node; instead got ${typeof node}.`);
    }
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
          if (isTextNode(childNode)) {
            cloneNode.append(childNode.cloneNode());
            return;
          }
          if (childNode.className && childNode.className.includes(ANKI_ADD_BUTTON_CLASS)) {
            return; // Ignore anki button
          }
          const childNodeStyle = window.getComputedStyle(childNode);
          if (childNodeStyle.display === 'none' || childNodeStyle.opacity === '0') {
            return; // Ignore the hidden elements
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
    text
      .replace(/\s*style=""\s*/gm, ' ')
      .replace(/\s*name=""\s*/gm, ' ')
      .replace(/\s*class=""\s*/gm, ' ');

  // Create a stringified html screenshot of a node, with style! 😎
  // transformTree   function     transform the node tree before stringify it.
  var stringifyNodeWithStyle = (node, transformTree = (a => a)) => {
    const transformedTree = transformTree(cloneNodeWithExplicitStyle(node));
    if (isTextNode(transformedTree)) {
      return transformedTree.textContent;
    } else {
      return removeEmptyTagAttributes(replaceAllCssColorToHexa(transformedTree.outerHTML));
    }
  };

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

  // @name         Anki Add Hooks for WordReference.com


  // Wordreference entries are laid as following:
  // <tr class="even">
  //   <td>First entry</td>
  //   <td>additional info of first entry</td>
  //   <td>translation of first entry</td>
  // </tr>
  // <tr class="even">
  //   <td>&nbsp;</td>
  //   <td>additional info of first entry</td>
  //   <td>translation of first entry</td>
  // </tr>
  // <tr class="odd">
  //   <td>Second entry</td>
  //   <td>additional info of second entry</td>
  //   <td>translation of second entry</td>
  // </tr>
  // <tr class="odd">
  //   <td>&nbsp;</td>
  //   <td>additional info of second entry</td>
  //   <td>translation of second entry</td>
  // </tr>
  // <tr class="odd">
  //   <td>&nbsp;</td>
  //   <td>additional info of second entry</td>
  //   <td>translation of second entry</td>
  // </tr>
  // <tr class="even">
  //   <td>Third entry</td>
  //   <td>additional info of third entry</td>
  //   <td>translation of third entry</td>
  // </tr>
  // <tr class="even">
  //   <td>&nbsp;</td>
  //   <td>additional info of third entry</td>
  //   <td>translation of third entry</td>
  // </tr>
  // Each entry can occupy several <tr>s, and one good way to distinguish them is
  // to monitor the alternance of <tr class="even"> and <tr class="odd">.
  const getTrGroups = (tableNode) => {
    const trGroups = [];
    let currentTrGroup = [];
    let currentTrClass = 'even';
    // console.log('tableNode.querySelectorAll():', tableNode.querySelectorAll('.even, .odd'))
    Array.from(tableNode.querySelectorAll('.even, .odd'))
      .sort((a, b) => a.rowIndex - b.rowIndex)
      .forEach((trNode) => {
        if (trNode.className.includes(currentTrClass)) {
          currentTrGroup.push(trNode);
        } else {
          trGroups.push(currentTrGroup);
          currentTrGroup = [trNode];
          currentTrClass = currentTrClass === 'even' ? 'odd' : 'even';
        }
      });
    trGroups.push(currentTrGroup);
    return trGroups;
  };


  const getExamplesTdFromTrGroup = (trGroup, exampleClassName) =>
    Array.from(trGroup)
      .map(trNode => trNode.querySelectorAll('td')[1])
      // .map((td) => {
      //   console.log('td:', td)
      //   return td
      // })
      .filter(td => td && td.className && td.className.includes(exampleClassName))
      .map(td => `<div style="color:#808080;">${td.innerText}</div>`);

  const getAdditionalInfosFromTrGroup = trGroup =>
    trGroup
      .map(tr => tr.querySelectorAll('td')[1])
      .filter(td => td && !td.className.includes('FrEx') && !td.className.includes('ToEx'))
      .map(td => Array.from(td.childNodes))
      .map(
        nodes => nodes
          .filter(node => !node.className || !node.className.includes('dsense'))
          .map(node => stringifyNodeWithStyle(node).trim())
          .filter(html => html)
      )
      .filter(stringifiedNodes => stringifiedNodes.length > 0)
      .map(stringifiedNodes => `<div>${stringifiedNodes.join('')}</div>`);


  const extractFrontText = (trGroup) => {
    const wordNode = trGroup[0].querySelectorAll('td')[0];
    const additionalInfos = getAdditionalInfosFromTrGroup(trGroup);
    const examples = getExamplesTdFromTrGroup(trGroup, 'FrEx');
    return [
      stringifyNodeWithStyle(wordNode),
      (additionalInfos.length > 0 ? '<br/>' : ''),
      ...additionalInfos,
      (examples.length > 0 ? '<br/>' : ''),
      ...examples,
    ].join('');
  };


  const extractBackText = (trGroup) => {
    const extractedRows = trGroup
      .map((trNode) => {
        const [, secondCell, thirdCell] = Array.from(trNode.querySelectorAll('td'));
        if (!thirdCell) {
          return null;
        }
        const additionalInfo = secondCell.querySelector('.dsense');
        return `<tr>
                <td>
                  ${additionalInfo ? stringifyNodeWithStyle(additionalInfo) : ''}
                </td>
                ${stringifyNodeWithStyle(thirdCell)}
              </tr>`;
      })
      .filter(tr => tr);
    const examples = getExamplesTdFromTrGroup(trGroup, 'ToEx');
    return `<table style="margin:auto;text-align:left;">
            ${extractedRows.join('')}
          </table>
          ${examples.length > 0 ? `<br/>${examples.join('')}` : ''}
          `;
  };


  const addHooksInTrGroup = (trGroup, createHook) => {
    const parent = trGroup[0].querySelector('td:last-child');
    parent.style.position = 'relative';
    const hook = createHook(trGroup);
    hook.style.position = 'absolute';
    hook.style.right = '-80px';
    highlightOnHookHover(hook, trGroup, 'gold');
    parent.append(hook);
  };


  const addHooksInTable = (tableNode, createHook) => {
    getTrGroups(tableNode).forEach(trGroup => addHooksInTrGroup(trGroup, createHook));
  };


  const getTables = () => document.querySelectorAll('.WRD');


  const getLanguages = () => {
    const urlMatch = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})(\/(reverse))?\//);
    if (urlMatch[4] === 'reverse') {
      // e.g. http://www.wordreference.com/czen/reverse/foobar means en -> cz
      return [urlMatch[2], urlMatch[1]];
    } else {
      // e.g. http://www.wordreference.com/czen/foobar means cz -> en
      return [urlMatch[1], urlMatch[2]];
    }
  };


  const hookName = 'wordreference.com';

  const extract = (trGroup) => {
    const [sourceLanguage, targetLanguage] = getLanguages();
    // console.log('extractFrontText(trGroup):', extractFrontText(trGroup))
    return {
      frontText: extractFrontText(trGroup),
      backText: extractBackText(trGroup),
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  };


  const run = (createHook) => {
    getTables().forEach(tableNode => addHooksInTable(tableNode, createHook));
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
    console.log('frontText:', frontText);
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
    if (!extract || typeof extract !== 'function') {
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
      const extractedFields = extract(userdata);
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


  run(createHook);

}());
