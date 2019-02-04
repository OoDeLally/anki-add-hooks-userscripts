Add a button on translation websites to create an Anki card from a translation.

![Screenshot](/doc/images/screenshot.png)

## Currently supported websites

### translate.google.com

  [/hooks/translate_google_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/translate_google_com_hook.user.js)

### wordreference.com

  [/hooks/wordreference_com_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/wordreference_com_hook.user.js)

### reverso.net

  [/hooks/reverso_net_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/reverso_net_hook.user.js)

### lingea.cz

  [/hooks/lingea_cz_hook.user.js](https://github.com/OoDeLally/tampermonkey-anki-add-hooks/raw/master/hooks/lingea_cz_hook.user.js)


## Quick setup


1- Install [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).

2- Click on some of the links above to install the Hook User Scripts on the websites of your choice.

3- Install and run Anki Desktop **with the AnkiConnect add-on**. The Anki app must be running when the hook is clicked on a website.

4- Anki's "Add" Button will appear on the translation pages for the websites you installed.

5- [File an issue](https://github.com/OoDeLally/anki-add-hooks-userscripts/issues) for any unexpected behavior.


## Create a hook for another website

1- Make sure Tampermonkey has `Native Script Import` enabled in settings.

2- Install the script [./dev.user.js](https://github.com/OoDeLally/anki-add-hooks-userscripts/blob/master/dev.user.js) after having fixed the `@include` and `@require` metatags.

3- Create your own `src/hooks/my_website_com.js` from the provided template [src/new_hook_template.js](https://github.com/OoDeLally/anki-add-hooks-userscripts/blob/master/src/new_hook_template.js) and fix inside all the metatags and the exported members.

4- Run `npm run dev-build` to compile it to `dev-hooks/my_website_com_dev_hook.user.js`.

5- Now when you modify and save `src/hooks/my_website_com.js`, you just need to reload your website to see the result of your modifications, without having to reinstall your script everytime!

6- When you are happy with your script, run `npm run build` to compile it to the final userscript `hooks/my_website_com_hook.user.js`.

7- Make a pull-request if you think it can be useful for other people.
