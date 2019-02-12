// Template to start creating a new hook.
// Rename this file to start your own hook.


// These following metatags will be appended to the compiled userscript.
// @name         Anki Add Hooks for My Website // FIXME
// @version      0.1 // FIXME
// @description  Generate a hook for AnkiConnect on My Website // FIXME
// @author       Your Name // FIXME
// @include      /mywebsite.com/ // FIXME


const extract = (parentNode) => {
  return {
    frontText: 'card front text', // FIXME
    backText: 'card back text', // FIXME
    frontLanguage: 'french', // FIXME,
    backLanguage: 'english', // FIXME,
    cardKind: 'french <-> english', // FIXME
  };
};


// Added cards will be tagged with that name.
export const hookName = 'my_website.com';


// Called after the page is loaded.
export const run = (createHook) => {
  // FIXME
  const parentNode = locateParentNode();
  const hook = createHook(() => extract(parentNode));
  parentNode.append(hook);
};
