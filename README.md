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

1- Create your own `src/hooks/my_website_com.js`, and define in it the following functions:
  * **run()** is called after the page is loaded. It must create hooks and place them in the DOM.
  Use `createHook(userdata)` to generate a hook node.
  `createHook(userdata)` returns a DOM node.
  `userdata` will be passed as it is to `extractFrontText(userdata)` and `extractBackText(userdata)`.
  Use it for example to provide the relative parent node, in case you have several hooks in the page.
  * **extractFrontText(userdata)** is called once the user clicks on a hook. It must return a string containing the front value of the card. `userdata` comes from `createHook(userdata)` in the `run()` you defined.
  * **extractBackText(userdata)** is called once the user clicks on a hook. It must return a string containing the back value of the card. `userdata` comes from `createHook(userdata)` in the `run()` you defined.

2- Compile it to `hooks/my_website_com_hook.user.js` by using `npm run build`.

3- Make a pull-request if you think it can be useful for other people.
