// ==UserScript==
// @namespace    https://github.com/OoDeLally
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      localhost
// @name         Anki Add Hooks for lingea.cz
// @version      0.3
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/lingea_cz.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/lingea_cz.js":
/*!**************************!*\
  !*** ./src/lingea_cz.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

// @name         Anki Add Hooks for lingea.cz
// @version      0.3
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/
function extractFrontText(data) {
  var sourceSentence = document.querySelector('h1').innerText;
  return sourceSentence;
}

function extractBackText(data) {
  var translationRows = Array.from(document.querySelectorAll('.entry tr')).filter(function (tr) {
    return !tr.className || !tr.className.includes('head');
  });
  var definitionText = translationRows.map(function (tr) {
    return tr.innerText;
  }).join('\n');
  return definitionText;
}

function run() {
  setInterval(function () {
    var parentNode = document.querySelector('.entry tr.head td');

    if (!parentNode) {
      return; // Container not found
    }

    var existingHook = parentNode.querySelector('.-anki-quick-adder-hook');

    if (existingHook) {
      return; // Hook already exists
    }

    var hook = createHook();
    parentNode.appendChild(hook);
  }, 500);
}

const ankiRequestOnFail = async (response, message) => {
  console.error('Anki request response:', response);
  console.error(message);

  if (message.includes('deck was not found')) {
    await GM.setValue('deckName', null);
  }

  if (message.includes('model was not found')) {
    await GM.setValue('modelName', null);
  }

  alert(`AnkiConnect returned an error:\n${message}`);
};

const ankiRequestOnSuccess = hookNode => {
  hookNode.classList.add('-anki-quick-adder-hook-added');
  hookNode.querySelector('.text').innerText = 'Added';

  hookNode.onclick = () => {};
};

const hookOnClick = async (hookNode, frontText, backText) => {
  let deckName = await GM.getValue('deckName');

  if (!deckName) {
    deckName = prompt('Enter the name of the deck you want to add cards from this website', 'Default');

    if (!deckName) {
      return;
    }

    GM.setValue('deckName', deckName);
  }

  let modelName = await GM.getValue('modelName');

  if (!modelName) {
    modelName = prompt('Enter the name of the card model you want to create', 'Basic (and reversed card)');

    if (!modelName) {
      return;
    }

    await GM.setValue('modelName', modelName);
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
      ankiRequestOnFail(response, 'Request was aborted');
    },
    onerror: response => {
      ankiRequestOnFail(response, 'Failed to connect to Anki Desktop. Make sure it is running and the AnkiConnect add-on is installed.');
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
  hookNode.setAttribute('name', "Anki Add Hooks for lingea.cz");
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

    hookOnClick(hookNode, frontText, backText);
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
  style.appendChild(document.createTextNode(".-anki-quick-adder-hook {\n  width: 35px;\n  height: 15px;\n  box-sizing: content-box;\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n  opacity: 0.6;\n  overflow: hidden;\n  z-index: 1000;\n  border-radius: 5px;\n  padding-left: 30px;\n  padding-right: 5px;\n  color: white;\n  font-size: 12px;\n  font-weight: bold;\n  background-color: #aaaaaa;\n  border: 2px solid #222222;\n  line-height: 17px;\n  top: 0px;\n  right: 0px;\n  cursor: pointer;\n  user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  -webkit-touch-callout: none;\n  -o-user-select: none;\n  -moz-user-select: none;\n}\n.-anki-quick-adder-hook-added {\n  border: 2px solid green;\n  opacity: 1;\n  cursor: auto;\n  color: #ccff99;\n}\n.-anki-quick-adder-hook:hover {\n  opacity: 1;\n}\n.-anki-quick-adder-hook-star {\n  display: block;\n  transform: rotate(-15deg);\n  position: absolute;\n}\n.-anki-quick-adder-hook-star-big {\n  font-size: 40px;\n  color: white;\n  z-index: 1005;\n  left: -7px;\n  top: -1px;\n}\n.-anki-quick-adder-hook-star-small {\n  font-size: 25px;\n  color: #0099ff;\n  z-index: 1010;\n  left: 0px;\n  top: -1px;\n}\n"));
  document.getElementsByTagName('head')[0].appendChild(style);
  run();
})();

/***/ })

/******/ });