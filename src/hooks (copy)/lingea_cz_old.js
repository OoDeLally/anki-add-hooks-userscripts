// @name         Anki Add Hooks for lingea.cz
// @version      0.1
// @description  Generate a hook for AnkiConnect on Lingea.cz
// @author       Pascal Heitz
// @include      /slovniky\.lingea\.cz\/\w+-\w+/\w+/



function extractFrontText(data) {
  const sourceSentence = document.querySelector('table.entry  .head .lex_ful_entr').innerText;
  return sourceSentence;
}

function extractBackText(data) {
  const translationRows = Array.from(document.querySelectorAll('.entry tr'))
    .filter(tr => !tr.className || !tr.className.includes('head'));
  const definitionText = translationRows.map(tr => tr.innerText).join('\n');
  return definitionText;
}

function extractDirection() {
  const match = window.location.href.match(/lingea\.cz\/(\w+-\w+)\//);
  if (!match) {
    throw Error('Failed to extract direction');
  }
  return match[1];
}


function run(){
  setInterval(() => {
    const parentNode = document.querySelector('.entry  tr.head td');
    if (!parentNode) {
      return // Container not found
    }
    const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
    if (existingHook) {
      return // Hook already exists
    }
    const hook = createHook();
    hook.style.position = 'absolute';
    hook.style.right = '10px';
    parentNode.appendChild(hook);
  }, 500);
}
