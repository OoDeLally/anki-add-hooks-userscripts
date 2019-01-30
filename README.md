Add a button on translation websites to create an Anki card from a translation.

![Screenshot](/doc/images/screenshot.png)

## Currently supported websites

### translate.google.com

  [/hooks/translate_google_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/translate_google_com_hook.user.js)

### wordreference.com

  [/hooks/wordreference_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/wordreference_com_hook.user.js)

### lingea.cz

  [/hooks/lingea_cz_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/lingea_cz_hook.user.js)


## Setup


1- Install Greasemonkey or Tampermonkey.

2- Click on some of the link above to install the Hook User Scripts.

3- Install and run Anki Desktop *with the AnkiConnect add-on*. The Anki app must be running when the hook is clicked on a website.

4- Anki's "Add" Button should appear on the translation pages of the websites you installed.



## Create a hook for another website

1- Create your own `src/hooks/my_website_com.js` following this model:
```
// @name         Anki Add Hooks for My Website
// @version      0.1
// @description  Generate a hook for AnkiConnect on My Website
// @author       Your Name
// @include      /mywebsite.com/

// Called once the user click on a hook.
function extractFrontText(data) {
  // First argument is exactly what you gave to createHook().
  return 'card front text';
}

// Called once the user click on a hook.
function extractBackText(data) {
  // First argument is exactly what you gave to createHook().
  return 'card back text';
}

// Called once the user click on a hook.
function extractDirection(data) {
  // First argument is exactly what you gave to createHook().
  // The returned string will be used to associate a deck name. It is useful if the
  // user wants different target decks depending on the translation direction.
  // e.g.  'fr -> en' and 'en -> fr' will be associated to deck "Learning French",
  // while 'de -> en' and 'en -> de' will be associated to deck "Learning German"
  return 'fr -> en';
}

// Called after the page is loaded.
function run(){
  const parentNode = locateParentNode();

  // `data` can be anything and will be passed as it is to `extractFrontText` and `extractBackText`.
  const data = {parentNode, foo: 'additional info you want to pass'}

  const hook = createHook(data); // createHook() is available.
  parentNode.append(hook);
}
```



2- Run `npm run build` to compile it to `hooks/my_website_com_hook.user.js`.

3- Make a pull-request if you think it can be useful for other people.
