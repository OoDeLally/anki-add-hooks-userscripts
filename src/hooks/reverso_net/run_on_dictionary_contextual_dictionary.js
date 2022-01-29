import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import getLanguages from './get_languages';

// e.g. https://dictionnaire.reverso.net/francais-anglais/hello
//        Table on the bottom with a few examples.

const extractFrontText = (itemDiv) => {
  const div = querySelector(itemDiv, '.source');
  return div.innerText;
};


const extractBackText = (itemDiv) => {
  const div = querySelector(itemDiv, '.target');
  return div.innerText;
};


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


const tryToAddHook = (createHook) => {
  querySelectorAll(document, '.context-examples .example', { throwOnUnfound: false })
    .forEach((itemDiv) => {
      if (doesAnkiHookExistIn(itemDiv)) {
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
      hook.style.top = '10px';
      hook.style.right = '5px';
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
