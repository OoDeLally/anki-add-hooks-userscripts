import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { doesAnkiHookExistIn, querySelector, querySelectorAll } from '../../helpers/scraping';
import getLanguages from './get_languages';


const extractFrontText = () => {
  const textArea = querySelector(document, '.translation-input__main__textarea-and-sentences textarea');
  return textArea.value;
};

const extractBackText = (contextItem) => {
  const translationSpan = querySelector(contextItem, '.text__translation');
  return translationSpan.innerText;
};

const tryToAddHook = (createHook) => {
  const contextItems = querySelectorAll(document, '.context-item', { throwOnUnfound: false });
  contextItems.forEach((contextItem) => {
    const optionBar = querySelector(contextItem, '.options', { throwOnUnfound: false });
    if (!(contextItem && optionBar)) {
      return; // The translation may not have been loaded yet. Better luck next time?
    }
    if (doesAnkiHookExistIn(optionBar)) {
      return;
    }
    const hook = createHook(() => {
      const [sourceLanguage, targetLanguage] = getLanguages();
      return {
        frontText: extractFrontText(),
        backText: extractBackText(contextItem),
        frontLanguage: sourceLanguage,
        backLanguage: targetLanguage,
        cardKind: `${sourceLanguage} -> ${targetLanguage}`,
      };
    });
    highlightOnHookHover(hook, contextItem, 'lightblue');
    optionBar.prepend(hook);
  });
};


export default (createHook) => {
  setInterval(() => {
    try {
      tryToAddHook(createHook);
    } catch (error) {
      console.error(error);
    }
  }, 500);
};
