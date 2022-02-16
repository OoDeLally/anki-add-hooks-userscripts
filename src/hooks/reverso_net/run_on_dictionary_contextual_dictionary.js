import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import getLanguages from './get_languages';

// e.g. https://dictionnaire.reverso.net/francais-anglais/hello
//        Table on the bottom with a few examples.

const extractFrontText = (itemDiv) => {
  const td = querySelector(itemDiv, '.src');
  return td.innerText;
};


const extractBackText = (itemDiv) => {
  const td = querySelector(itemDiv, '.tgt');
  return td.innerText;
};


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


const tryToAddHook = (createHook) => {
  querySelectorAll(document, '#contextSection table.contextlist tr', { throwOnUnfound: false })
    .forEach((itemDiv) => {
      if (doesAnkiHookExistIn(itemDiv)) {
        return;
      }
      const srcTd = querySelector(itemDiv, '.src', { throwOnUnfound: false });
      const tgtTd = querySelector(itemDiv, '.tgt', { throwOnUnfound: false });
      if (!srcTd && !tgtTd) {
        // Probably a header e.g. https://woerterbuch.reverso.net/%C3%BCbersetzung/deutsch-portugiesisch/bildhauer
        return;
      }
      const hook = createHook(() => {
        const [sourceLanguage, targetLanguage] = getLanguages();
        return {
          frontText: extractFrontText(itemDiv),
          backText: extractBackText(itemDiv),
          frontLanguage: sourceLanguage,
          backLanguage: targetLanguage,
          cardKind: `${sourceLanguage} -> ${targetLanguage}`,
        };
      });
      hook.style.position = 'absolute';
      hook.style.top = '0px';
      hook.style.right = '-80px';
      highlightOnHookHover(hook, itemDiv, 'lightblue');
      itemDiv.style.position = 'relative';
      itemDiv.append(hook);
    });
};

export default (createHook) => {
  setInterval(() => {
    tryToAddHook(createHook);
  }, 500);
};
