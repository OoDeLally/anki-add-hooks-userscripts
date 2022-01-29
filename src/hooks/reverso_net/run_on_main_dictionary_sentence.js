import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, doesAnkiHookExistIn } from '../../helpers/scraping';
import getLanguages from './get_languages';


const extractFrontText = () => {
  const textArea = querySelector(document, '.translation-input__main__textarea-and-sentences textarea');
  return textArea.value;
};

const extractBackText = () => {
  const translationDiv = querySelector(document, '.translation-input__result .sentence-wrapper');
  return translationDiv.innerText;
};

const tryToAddHook = (createHook) => {
  const resultInput = querySelector(document, '.translation-input__result', { throwOnUnfound: false });
  if (!resultInput) {
    return;
  }
  const translationDiv = querySelector(document, '.translation-input__result .sentence-wrapper', { throwOnUnfound: false });
  const optionBar = querySelector(document, '.translation-input__target .translation-input__bottom_controls', { throwOnUnfound: false });
  if (!(translationDiv && optionBar)) {
    return; // The translation may not have been loaded yet. Better luck next time?
  }
  if (doesAnkiHookExistIn(optionBar)) {
    return;
  }
  const hook = createHook(() => {
    const [sourceLanguage, targetLanguage] = getLanguages();
    return {
      frontText: extractFrontText(),
      backText: extractBackText(),
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.position = 'absolute';
  hook.style.right = '40px';
  hook.style.top = '12px';
  highlightOnHookHover(hook, translationDiv, 'lightblue');
  optionBar.style.position = 'relative';
  optionBar.append(hook);
};

export default (createHook) => {
  setInterval(() => {
    tryToAddHook(createHook);
  }, 500);
};
