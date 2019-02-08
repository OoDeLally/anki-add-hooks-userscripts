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

  const allowedAttributes = ['style'];


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


  const handleScrappingError = (error) => {
    const productionExtraMessage = `
    Please report the following infos at:
    https://github.com/OoDeLally/anki-add-hooks-userscripts/issues`;
    console.error(
      `AnkiAddHooks: Error during web page scrapping. ${
      productionExtraMessage
    }

     Message: ${error.message}.

     Page: ${error.location}.

     Hook Template Version: 1.0.0.

     Hook Userscript Name: ${hookName}.

     Hook UserScript Version: 0.1.

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


  // Extract the data from the web page
  const extractPageFields = (userdata) => {
    const extractedFields = extract(userdata);
    if (typeof extractedFields !== 'object') {
      console.error('Found', extractedFields);
      throw Error('Provided siteSpecificFunctions.extract() fonction did not return an object');
    }
    const {
      frontText, backText, cardKind
    } = extractedFields;
    // console.log('frontText:', frontText)
    // console.log('backText:', backText)
    // console.log('cardKind:', cardKind)

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


  // Associate a deck to the kind of card
  const getDeckName = async (cardKind) => {
    const deckNameMapKey = getDeckNameMapKey(cardKind);
    let deckName = await GM.getValue(deckNameMapKey);
    if (!deckName) {
      deckName = prompt(`Enter the name of the deck you want to add '${cardKind}' cards from this website`, 'Default');
      if (!deckName) {
        throw Error('Adding was cancelled');
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
        throw Error('Adding was cancelled');
      }
      await GM.setValue(modelNameMapKey, modelName);
    }
    return modelName;
  };


  const AnkiCardAddingError = (message, response) => {
    const error = Error(message);
    error.name = 'AnkiCardAddingError';
    error.response = response;
    return error;
  };


  const ankiConnectRequest = (action, params) =>
    new Promise(
      async (resolve, reject) =>
        GM.xmlHttpRequest({
          method: 'POST',
          url: 'http://localhost:8765',
          data: JSON.stringify({ action, version: 6, params }),
          onabort: (response) => {
            reject(AnkiCardAddingError('Request was aborted', response));
          },
          onerror: (response) => {
            reject(AnkiCardAddingError(
              'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.',
              response
            ));
          },
          onload: (response) => {
            const result = JSON.parse(response.responseText);
            if (result.error) {
              reject(AnkiCardAddingError(result.error, response));
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


  const onHookClick = async (event, userdata, hookNode) => {
    event.preventDefault();
    event.stopPropagation();
    let fields;
    try {
      fields = extractPageFields(userdata);
      await ankiConnectAddRequest(fields);
      ankiRequestOnSuccess(hookNode);
    } catch (error) {
      if (error.name === 'ScrappingError') {
        handleScrappingError(error);
      } else if (error.name === 'AnkiCardAddingError') {
        ankiRequestOnFail(error.response, error.message, fields.cardKind);
      } else {
        throw error;
      }
    }
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
    hookNode.appendChild(starNodeBig);
    hookNode.appendChild(starNodeSmall);
    hookNode.appendChild(textNode);
    hookNode.onclick = event => onHookClick(event, userdata, hookNode);
    return hookNode;
  };


  try {
    run(createHook);
  } catch (error) {
    if (error.name === 'ScrappingError') {
      handleScrappingError(error);
    } else {
      throw error;
    }
  }

}());
