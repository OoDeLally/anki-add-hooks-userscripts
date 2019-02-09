// Template to start creating a new hook.
// Rename this file to start your own hook.


// These following metatags will be appended to the compiled userscript.
// @name         Anki Add Hooks for My Website // FIXME
// @version      0.1 // FIXME
// @description  Generate a hook for AnkiConnect on My Website // FIXME
// @author       Your Name // FIXME
// @include      /mywebsite.com/ // FIXME


// Added cards will be tagged with that name.
export const hookName = 'my_website.com';


export const extract = (data) => {
  // First argument `data` is exactly what you gave to createHook().
  return {
    frontText: 'card front text', // FIXME
    backText: 'card back text', // FIXME
    frontLanguage: 'french', // FIXME,
    backLanguage: 'english', // FIXME,
    cardKind: 'french <-> english', // FIXME
  };
};


// Called after the page is loaded.
export const run = (createHook) => {
  // FIXME
  const parentNode = locateParentNode();

  // `data` can be anything and will be passed as it is to `extractFrontText` and `extractBackText`.
  const data = { parentNode, foo: 'additional info you want to pass' };

  const hook = createHook(data);
  parentNode.append(hook);
};
