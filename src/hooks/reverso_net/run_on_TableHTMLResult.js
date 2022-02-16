import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { doesAnkiHookExistIn, querySelector } from '../../helpers/scraping';
import getLanguages from './get_languages';

// e.g. https://woerterbuch.reverso.net/%C3%BCbersetzung/deutsch-portugiesisch/bildhauer


const tryToAddHook = (createHook) => {
  const parentDiv = querySelector(document, '.center_frameColl', { throwOnUnfound: false, throwOnFoundSeveral: false });
  if (!parentDiv) {
    return;
  }
  if (doesAnkiHookExistIn(parentDiv)) {
    return;
  }
  const srcSpan = querySelector(parentDiv, '.CollResSrc');
  const tgtSpan = querySelector(parentDiv, '.tgtColl');
  const hook = createHook(() => {
    const [sourceLanguage, targetLanguage] = getLanguages();
    return {
      frontText: srcSpan.innerText,
      backText: tgtSpan.innerText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.position = 'absolute';
  hook.style.top = '0px';
  hook.style.right = '-80px';
  highlightOnHookHover(hook, parentDiv, 'lightblue');
  parentDiv.style.position = 'relative';
  parentDiv.append(hook);
};

export default (createHook) => {
  setInterval(() => {
    tryToAddHook(createHook);
  }, 500);
};
