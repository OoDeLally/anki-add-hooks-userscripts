const ankiRequestOnFail = async (response, message, directionCode) => {
  console.error('Anki request response:', response)
  console.error(message)
  if (message.includes('deck was not found')) {
    await GM.setValue(getDeckNameMapKey(directionCode), null);
  }
  if (message.includes('model was not found')) {
    await GM.setValue(getModelNameMapKey(directionCode), null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
}

const getDeckNameMapKey = directionCode => `deckName_${directionCode.toLowerCase()}`;
const getModelNameMapKey = directionCode => `modelName_${directionCode.toLowerCase()}`;

const ankiRequestOnSuccess = (hookNode) => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';
  hookNode.onclick = () => {};
}

const hookOnClick = async (hookNode, frontText, backText, directionCode) => {
  const deckNameMapKey = getDeckNameMapKey(directionCode);
  let deckName = await GM.getValue(deckNameMapKey);
  if (!deckName) {
    deckName = prompt(`Enter the name of the deck you want to add '${directionCode}' cards from this website`, 'Default');
    if (!deckName) {
      return // Cancel
    }
    GM.setValue(deckNameMapKey, deckName);
  }
  const modelNameMapKey = getModelNameMapKey(directionCode);
  let modelName = await GM.getValue(modelNameMapKey);
  if (!modelName) {
    modelName = prompt(`Enter the name of the card model you want to create for '${directionCode}'`, 'Basic (and reversed card)');
    if (!modelName) {
      return // Cancel
    }
    await GM.setValue(modelNameMapKey, modelName);
  }
  // console.log('hookOnClick')
  const dataStr = JSON.stringify({
    action: 'addNote',
    version: 6,
    params: {
      note: {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: frontText,
          Back: backText,
        },
        tags: [hookName],
      }
    }
  });
  return GM.xmlHttpRequest({
    method: 'POST',
    url: 'http://localhost:8765',
    data: dataStr,
    onabort: response => {
      ankiRequestOnFail(response, 'Request was aborted', directionCode);
    },
    onerror: response => {
      ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', directionCode)
    },
    onload: response => {
      const result = JSON.parse(response.responseText);
      if (result.error) {
        ankiRequestOnFail(response, result.error);
        return
      }
      ankiRequestOnSuccess(hookNode)
    }
  })
}


const createHook = (userdata) => {
  if (!extractFrontText || typeof extractFrontText != 'function') {
    throw Error('Second argument must be a function which extract text for the front side of the card');
  }
  if (!extractBackText || typeof extractBackText != 'function') {
    throw Error('Third argument must be a function which extract text for the back side of the card');
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
    if (typeof frontText != 'string') {
      console.error('Found', frontText);
      throw Error('Provided extractFrontText() fonction did not return a string');
    }
    const backText = extractBackText(userdata);
    if (typeof frontText != 'string') {
      console.error('Found', backText);
      throw Error('Provided extractBackText() fonction did not return a string');
    }
    const directionCode = extractDirection(userdata);
    if (typeof frontText != 'string') {
      console.error('Found', directionCode);
      throw Error('Provided extractDirection() fonction did not return a string');
    }
    hookOnClick(hookNode, frontText, backText, directionCode);
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
}


(function() {
  'use strict';

  var style = document.createElement('style');
  style.appendChild(document.createTextNode(PLACEHOLDER_STYLE_TEXT));
  document.getElementsByTagName('head')[0].appendChild(style);

  run();
})();
