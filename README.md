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

function extractFrontText(parentNode) {
  // Called once the user click on a hook.
  // First argument is exactly what you gave to createHook()
  return 'card front text';
}

function extractBackText(parentNode) {
  // Called once the user click on a hook.
  // First argument is exactly what you gave to createHook()
  return 'card back text';
}

function run(){
  // Called after the page is loaded.
  const parentNode = locateParentNode();
  const hook = createHook(parentNode); // createHook() is available
  parentNode.append(hook);
}
```



2- Run `npm run build` to compile it to `hooks/my_website_com_hook.user.js`.

3- Make a pull-request if you think it can be useful for other people.
