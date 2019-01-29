// @name         Anki Add Hooks for lingea.cz
// @version      0.3
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/


function extractFrontText(data) {
  const sourceSentence = document.querySelector('h1').innerText;
  return sourceSentence;
}

function extractBackText(data) {
  const translationRows = Array.from(document.querySelectorAll('.entry tr'))
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const definitionText = translationRows.map(tr => tr.innerText).join('\n');
  return definitionText;
}



function run(){
  setInterval(() => {
    const parentNode = document.querySelector('.entry tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return // Hook already exists
    }
    const hook = createHook();
    parentNode.appendChild(hook);
  }, 500);
}
