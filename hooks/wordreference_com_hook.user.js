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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/hooks/wordreference_com.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hooks/wordreference_com.js":
/*!****************************************!*\
  !*** ./src/hooks/wordreference_com.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// @name         Anki Add Hooks for WordReference.com
// @version      0.1
// @description  Generate a hook for AnkiConnect on WordReference.com
// @author       Pascal Heitz
// @include      /http://www\.wordreference\.com\/[a-z]{4}\/.+/
function getLanguageCodes() {
  var match = window.location.href.match(/wordreference\.com\/([a-z]{2})([a-z]{2})\//);
  return [match[1], match[2]];
}

function getTrGroups(tableNode) {
  var trGroups = [];
  var currentTrGroup = [];
  var currentTrClass = 'even'; // console.log('tableNode.querySelectorAll():', tableNode.querySelectorAll('.even, .odd'))

  Array.from(tableNode.querySelectorAll('.even, .odd')) // .sort((a, b) => a.rowIndex - b.rowIndex)
  .forEach(function (trNode) {
    if (trNode.className == currentTrClass) {
      currentTrGroup.push(trNode);
    } else {
      trGroups.push(currentTrGroup);
      currentTrGroup = [trNode];
      currentTrClass = currentTrClass == 'even' ? 'odd' : 'even';
    }
  });
  trGroups.push(currentTrGroup);
  return trGroups;
}

function extractFrontText(trGroup) {
  var firstRowTds = trGroup[0].querySelectorAll('td');
  var firstCell = firstRowTds[0];
  var firstCellStrong = firstCell.querySelector('strong');

  if (!firstCellStrong) {
    return; // Not a real definition row
  }

  var firstCellStrongChildren = Array.from(firstCellStrong.childNodes).filter(function (node) {
    return node.nodeName != 'A';
  });
  var firstChildText = firstCellStrongChildren.map(function (node) {
    return node.textContent;
  }).join('');
  var remainingChildrenTexts = Array.from(firstCell.childNodes).slice(1).map(function (node) {
    return node.innerText;
  }).filter(function (text) {
    return text;
  }).map(function (text) {
    return text.trim();
  }).filter(function (text) {
    return text;
  });
  var frontText = "".concat(getLanguageCodes()[0].toUpperCase(), "\n").concat(firstChildText);

  if (remainingChildrenTexts.length > 0) {
    frontText += " [".concat(remainingChildrenTexts.join(' '), "]");
  }

  var secondCellText = Array.from(firstRowTds[1].childNodes).filter(function (node) {
    return !node.className || !node.className.includes('dsense');
  }).map(function (node) {
    return node.textContent;
  }).join('');

  if (secondCellText) {
    frontText += " (".concat(secondCellText.trim(), ")");
  }

  return frontText;
}

function extractBackText(trGroup) {
  return "".concat(getLanguageCodes()[1].toUpperCase(), "\n") + trGroup.filter(function (tr) {
    return !(parseInt(tr.querySelector('td:last-child').getAttribute('colspan')) > 1);
  }).map(function (tr) {
    var tds = tr.querySelectorAll('td');
    var lastTd = tds[2];
    var lastTdChildren = Array.from(lastTd.childNodes);
    var backText = lastTdChildren[0].textContent;
    var firstTdOtherChildren = lastTdChildren.slice(1);

    if (firstTdOtherChildren.length > 0) {
      backText += "[".concat(firstTdOtherChildren.map(function (node) {
        return node.innerText;
      }), "]");
    }

    var middleTdText = Array.from(tds[1].childNodes).filter(function (node) {
      return node.className && node.className.includes('dsense');
    }).map(function (node) {
      return node.textContent;
    }).join('');

    if (middleTdText) {
      backText += " ".concat(middleTdText);
    }

    return backText;
  }).join('\n');
}

function addHooksInTrGroup(trGroup) {
  var parent = trGroup[0].querySelector('td');
  parent.style.position = 'relative';
  var hook = createHook(trGroup);
  hook.style.position = 'absolute';
  hook.style.left = '-80px';
  parent.prepend(hook);
}

function addHooksInTable(tableNode) {
  getTrGroups(tableNode).forEach(addHooksInTrGroup);
}

function getTables() {
  return document.querySelectorAll('.WRD');
}

function extractDirection() {
  var languageCodes = getLanguageCodes();
  return "".concat(languageCodes[0], " -> ").concat(languageCodes[1]);
}

function run() {
  getTables().forEach(addHooksInTable);
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

const getDeckNameMapKey = directionCode => `deckName_${directionCode}`;

const getModelNameMapKey = directionCode => `modelName_${directionCode}`;

const ankiRequestOnSuccess = hookNode => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.text').innerText = 'Added';

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
        tags: []
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
  textNode.className = 'text';
  textNode.innerText = 'Add';
  const hookNode = document.createElement('div');
  hookNode.setAttribute('name', "Anki Add Hooks for WordReference.com");
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
  style.appendChild(document.createTextNode(".-anki-quick-adder-hook {\n  width: 35px;\n  height: 15px;\n  box-sizing: content-box;\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n  opacity: 0.6;\n  overflow: hidden;\n  z-index: 1000;\n  border-radius: 5px;\n  padding-left: 30px;\n  padding-right: 5px;\n  color: white;\n  font-size: 12px;\n  font-weight: bold;\n  background-color: #aaaaaa;\n  border: 2px solid #222222;\n  line-height: 17px;\n  top: 0px;\n  right: 0px;\n  cursor: pointer;\n  user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  -webkit-touch-callout: none;\n  -o-user-select: none;\n  -moz-user-select: none;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: lightgreen;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-added .-anki-quick-adder-hook-star-small {\n  color: green;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n"));
  document.getElementsByTagName('head')[0].appendChild(style);
  run();
})();

/***/ })

/******/ });