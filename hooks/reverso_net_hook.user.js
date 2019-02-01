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
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/hooks/reverso_net.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hooks/reverso_net.js":
/*!**********************************!*\
  !*** ./src/hooks/reverso_net.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

// @name         Anki Add Hooks for Reverso
// @version      0.1
// @description  Generate a hook for AnkiConnect on Reverso
// @author       Pascal Heitz
// @include      /reverso\.net\/\w+-\w+/\w+/
function getLanguageCodes() {
  var match = window.location.href.match(/reverso\.net\/([a-z]+)-([a-z]+)\//);

  if (!match) {
    throw Error('Failed to get language codes');
  }

  return [match[1], match[2]];
}

function extractMainTranslationFrontText() {
  var word = document.querySelector('h2').innerText;

  if (!word) {
    throw Error('Could not find source word');
  }

  var text = "".concat(getLanguageCodes()[0], "\n").concat(word);
  return text;
}

function extractMainTranslationBackText() {
  var blocks = Array.from(document.querySelectorAll('#TableHTMLResult div')).filter(function (div) {
    return div.getAttribute('border') == '1';
  });
  blocks.shift(); // The first block is the source word.

  var text = "".concat(getLanguageCodes()[1], "\n").concat(blocks.map(function (block) {
    return block.innerText;
  }).join('\n'));
  return text;
}

function extractCollaborativeTranslationFrontText(parentNode) {
  var word = parentNode.querySelector('.CDResSource').innerText;
  var text = "".concat(getLanguageCodes()[0], "\n").concat(word);
  return text;
}

function extractCollaborativeTranslationBackText(parentNode) {
  var word = parentNode.querySelector('.CDResTarget').innerText;
  var text = "".concat(getLanguageCodes()[1], "\n").concat(word);
  return text;
}

function extractFrontText(_ref2) {
  var type = _ref2.type,
      parentNode = _ref2.parentNode;

  if (type == 'mainDictionary') {
    return extractMainTranslationFrontText();
  } else if (type == 'collaborativeDictionary') {
    return extractCollaborativeTranslationFrontText(parentNode);
  } else {
    throw Error("Unknown type ".concat(type));
  }
}

function extractBackText(_ref) {
  var type = _ref.type,
      parentNode = _ref.parentNode;

  if (type == 'mainDictionary') {
    return extractMainTranslationBackText();
  } else if (type == 'collaborativeDictionary') {
    return extractCollaborativeTranslationBackText(parentNode);
  } else {
    throw Error("Unknown type ".concat(type));
  }
}

function extractDirection() {
  var languageCodes = getLanguageCodes();
  return "".concat(languageCodes[0], " -> ").concat(languageCodes[1]);
}

function run() {
  // There are two translation providers in reverso.
  // 1- the main reverso dictionary
  // 2- the collaborative dictionary
  // 1- real reverso dictionary
  var mainDictionarySourceNode = document.querySelector('h2');

  if (mainDictionarySourceNode) {
    var hook = createHook({
      type: 'mainDictionary'
    });
    hook.style.position = 'absolute';
    hook.style.right = '150px';
    hook.style.top = '10px';
    mainDictionarySourceNode.parentNode.append(hook);
  } // 2- collaborative dictionary


  var collaborativeDefinitionsRows = Array.from(document.querySelectorAll('.CDResTable tr')).filter(function (tr) {
    return tr.getAttribute('valign') == 'top';
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = collaborativeDefinitionsRows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var rowNode = _step.value;

      var _hook = createHook({
        type: 'collaborativeDictionary',
        parentNode: rowNode
      });

      _hook.style.position = 'absolute';
      _hook.style.left = '105px';
      var parentNode = rowNode.querySelector('.CDResAct');
      parentNode.style.position = 'relative';
      parentNode.append(_hook);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

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

const getDeckNameMapKey = directionCode => `deckName_${directionCode.toLowerCase()}`;

const getModelNameMapKey = directionCode => `modelName_${directionCode.toLowerCase()}`;

const ankiRequestOnSuccess = hookNode => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.-anki-quick-adder-hook-text').innerText = 'Added';

  hookNode.onclick = () => {};
};

const hookOnClick = async (hookNode, frontText, backText, directionCode) => {
  const deckNameMapKey = getDeckNameMapKey(directionCode);
  let deckName = await GM.getValue(deckNameMapKey);

  if (!deckName) {
    deckName = prompt(`Enter the name of the deck you want to add '${directionCode}' cards from this website`, 'Default');

    if (!deckName) {
      return;
    }

    GM.setValue(deckNameMapKey, deckName);
  }

  const modelNameMapKey = getModelNameMapKey(directionCode);
  let modelName = await GM.getValue(modelNameMapKey);

  if (!modelName) {
    modelName = prompt(`Enter the name of the card model you want to create for '${directionCode}'`, 'Basic (and reversed card)');

    if (!modelName) {
      return;
    }

    await GM.setValue(modelNameMapKey, modelName);
  }

  const dataStr = JSON.stringify({
    action: 'addNote',
    version: 6,
    params: {
      note: {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: frontText,
          Back: backText
        },
        tags: ["Anki Add Hooks for Reverso"]
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
      ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.', directionCode);
    },
    onload: response => {
      const result = JSON.parse(response.responseText);

      if (result.error) {
        ankiRequestOnFail(response, result.error);
        return;
      }

      ankiRequestOnSuccess(hookNode);
    }
  });
};

const createHook = userdata => {
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
  hookNode.setAttribute('name', "Anki Add Hooks for Reverso");
  hookNode.className = '-anki-quick-adder-hook';
  hookNode.title = 'Create an Anki card from this translation';

  hookNode.onclick = event => {
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
};

(function () {
  'use strict';

  var style = document.createElement('style');
  style.appendChild(document.createTextNode(".-anki-quick-adder-hook {\n  -moz-user-select: none;\n  -ms-user-select: none;\n  -o-user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  background-color: #aaaaaa;\n  border-radius: 5px;\n  border: 2px solid #222222;\n  box-sizing: content-box;\n  color: white;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Roboto', sans-serif;\n  font-size: 12px;\n  font-weight: bold;\n  height: 15px;\n  line-height: 17px;\n  opacity: 0.6;\n  overflow-wrap: normal;\n  overflow: hidden;\n  padding-left: 30px;\n  padding-right: 5px;\n  position: relative;\n  right: 0px;\n  text-align: left;\n  text-indent: 0;\n  top: 0px;\n  user-select: none;\n  vertical-align: middle;\n  width: 35px;\n  z-index: 1000;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-added .-anki-quick-adder-hook-star-small {\n  color: green;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  color: grdsdsdqwdfedwdsdwesdddsdwdn;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n\n.-anki-quick-adder-hook-text {\n\n}\n"));
  document.getElementsByTagName('head')[0].appendChild(style);
  run();
})();

/***/ })

/******/ });