var GM = {};
var initialized = false;


const appendStyleSheet = () => {
  var style = document.createElement('style');
  const css = GM.getResourceText('styleSheet');
  style.appendChild(document.createTextNode(css));
  document.getElementsByTagName('head')[0].appendChild(style);
}


const init = (injectedGM) => {
  if (!injectedGM) {
    throw Error('GM must be provided as first argument')
  }
  if (!injectedGM.getResourceText) {
    throw Error('GM.getResourceText must be available. Please add // @grant GM.getResourceText to your metadata')
  }
  if (!injectedGM.xmlhttpRequest) {
    throw Error('GM.xmlhttpRequest must be available. Please add // @grant GM.xmlhttpRequest to your metadata')
  }
  if (!injectedGM.setValue) {
    throw Error('GM.setValue must be available. Please add // @grant GM.setValue to your metadata')
  }
  if (!injectedGM.getValue) {
    throw Error('GM.getValue must be available. Please add // @grant GM.getValue to your metadata')
  }
  GM = injectedGM;
  appendStyleSheet();
  initialized = true;
}


const ankiRequestOnFail = (response, message) => {
  console.error('Anki request response:', response)
  console.error(message)
  if (message.includes('deck was not found')) {
    GM.setValue('deckName', null);
  }
  if (message.includes('model was not found')) {
    GM.setValue('modelName', null);
  }
  alert(`AnkiConnect returned an error:\n${message}`);
}


const ankiRequestOnSuccess = (hookNode) => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.text').innerText = 'Added';
  hookNode.onclick = () => {};
}

const hookOnClick = (hookNode, frontText, backText) => {
  let deckName = GM.getValue('deckName');
  if (!deckName) {
    deckName = prompt('Enter the name of the deck you want to add cards from this website', 'Default');
    if (!deckName) {
      return // Cancel
    }
  }
  let modelName = GM.getValue('modelName');
  if (!modelName) {
    modelName = prompt('Enter the name of the card model you want to create', 'Basic (and reversed card)');
    if (!modelName) {
      return // Cancel
    }
  }
  GM.setValue('deckName', deckName);
  GM.setValue('modelName', modelName);
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
        tags: [],
      }
    }
  });
  return GM.xmlhttpRequest({
    method: 'POST',
    url: 'http://localhost:8765',
    data: dataStr,
    onabort: response => {
      ankiRequestOnFail(response, 'Request was aborted');
    },
    onerror: response => {
      ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.')
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


const createHook = (hookName, extractFrontText, extractBackText) => {
  if (!initialized) {
    throw Error('AnkiAddHooks must be initialized first. Call AnkiAddHooks.init(GM)');
  }
  if (!hookName || typeof hookName != 'string') {
    throw Error('First argument must be the name of the hook');
  }
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
  textNode.className = 'text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', hookName);
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';
  hookNode.onclick = (event) => {
    const frontText = extractFrontText();
    if (typeof frontText != 'string') {
      console.error('Found', frontText);
      throw Error('Provided extractFrontText() fonction did not return a string');
    }
    const backText = extractBackText();
    if (typeof frontText != 'string') {
      console.error('Found', backText);
      throw Error('Provided extractBackText() fonction did not return a string');
    }
    hookOnClick(hookNode, frontText, backText);
    event.preventDefault();
    event.stopPropagation();
  };
  hookNode.appendChild(starNodeBig);
  hookNode.appendChild(starNodeSmall);
  hookNode.appendChild(textNode);
  return hookNode;
}



var AnkiAddHooks = {createHook, init}

console.log('AnkiAddHooks created:', AnkiAddHooks)
