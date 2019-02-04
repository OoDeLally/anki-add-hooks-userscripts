// Template to start creating a new hook.
// Rename this file to src/hooks/my_website_com.js.


// These following metatags will be appended to the compiled userscript.
// @name         Anki Add Hooks for My Website // FIXME
// @version      0.1 // FIXME
// @description  Generate a hook for AnkiConnect on My Website // FIXME
// @author       Your Name // FIXME
// @include      /mywebsite.com/ // FIXME



// Added cards will be tagged with that name.
export const hookName = 'my_website.com';

// Called once the user click on a hook.
export const extractFrontText = data => {
  // First argument `data` is exactly what you gave to createHook().
  // FIXME
  return 'card front text';
}

// Called once the user click on a hook.
export const extractBackText = data => {
  // First argument `data` is exactly what you gave to createHook().
  // FIXME
  return 'card back text';
}

// Called once the user click on a hook.
export const extractDirection = data => {
  // First argument `data` is exactly what you gave to createHook().
  // The returned string will be used to associate a deck name. It is useful if the
  // user wants different target decks depending on the translation direction.
  // e.g.  'fr -> en' and 'en -> fr' will be associated to deck "Learning French",
  // while 'de -> en' and 'en -> de' will be associated to deck "Learning German"
  // FIXME
  return 'fr -> en';
}

// Called after the page is loaded.
export const run = createHook => {
  // FIXME
  const parentNode = locateParentNode();

  // `data` can be anything and will be passed as it is to `extractFrontText` and `extractBackText`.
  const data = {parentNode, foo: 'additional info you want to pass'}

  const hook = createHook(data);
  parentNode.append(hook);
}
