Add a button on translation websites to create an Anki card from a translation.

![Screenshot](/doc/images/screenshot.png)

## Currently supported websites

### wordreference.com (Last update July 24, 2024)

  [/hooks/wordreference_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/wordreference_com_hook.user.js)

### reverso.net (Last update Feb 16, 2022)

  [/hooks/reverso_net_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/reverso_net_hook.user.js)

### lingea.cz

  [/hooks/lingea_cz_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/lingea_cz_hook.user.js)

### translate.google.com (Out-of-order)
  ⚠️ Currently does NOT work because of Google Translate's CSP, see [the related issue](https://github.com/OoDeLally/anki-add-hooks-userscripts/issues/44).

  [/hooks/translate_google_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/translate_google_com_hook.user.js)


## Super Quick Setup

1- Install a userscript add-on for your favorite browser:
* **Chrome**: install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
* **Firefox**: install [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) or [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/).
* **Safari**: install [Tampermonkey](https://tampermonkey.net/?browser=safari).
* **Other browsers**: Check [Tampermonkey Website](https://tampermonkey.net).

This extension allows the browser to run the AnkiAddHooks userscripts.

2- Click on some of the links to install the Hook User Scripts on the websites of your choice:
* [Install Anki Add Hooks on translate.google.com](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/translate_google_com_hook.user.js)
* [Install Anki Add Hooks on wordreference.com](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/wordreference_com_hook.user.js)
* [Install Anki Add Hooks on reverso.net](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/reverso_net_hook.user.js)
* [Install Anki Add Hooks on lingea.cz](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/lingea_cz_hook.user.js)

3- Install [Anki Desktop](https://apps.ankiweb.net/#download) and synchronize your Anki account.

4- Install the [AnkiConnect add-on](https://github.com/FooSoft/anki-connect#installation) for **Anki Desktop**, then **restart Anki Desktop**.

## Usage

1- Anki's **Add** Button will appear on the translation pages for the websites you installed.

2- **Anki Desktop** must be running on your computer when you click on a hook.

3- [File an issue](https://github.com/OoDeLally/anki-add-hooks-userscripts/issues) for any unexpected behavior.


## Create your custom hook for another website

The most convenient way to develop a new tampermonkey script is to install a userscript (that never changes) which `@require`s a local file on your computer. That local file will be recompiled everytime your source file is modified. Thus you don't need to manually recompile and reinstall your userscript everytime you change a thing. The following steps describe how to set up that environment.

1- Rename `src/hooks/my_website_com.js` and fix inside all the metatags and the exported members.

2- Run `npm install` to install dependencies.

3- Run `npm run dev-build` to create two files:
* `dev-hooks/my_website_com_dev_hook.user.js`
* `dev-hooks/my_website_com_dev_hook_required.js`

4- Make sure Tampermonkey extension is allowed to access local files from your computer:

    1- Go to `chrome://extensions` with Chrome.
    2- Find `Tampermonkey` and click `Details`.
    3- Find the `Allow access to file URLs` setting and turn it on.


You need this so that `my_website_com_dev_hook.user.js` is allowed to require local file `my_website_com_dev_hook_required.js`.

5- Install `dev-hooks/my_website_com_dev_hook.user.js` in Tampermonkey.

6- Now when you modify and save `src/hooks/my_website_com.js`, you just need to reload your website to see the result of your modifications, without having to reinstall your script everytime!

7- When you are happy with your script, run `npm run build` to compile it to the final standalone userscript `hooks/my_website_com_hook.user.js`.

8- Make a pull-request if you think it can be useful for other people.
