import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { doesAnkiHookExistIn, querySelector } from '../../helpers/scraping';
import getLanguages from './get_languages';


const extractFrontText = () => {
  const textArea = querySelector(document, '.translation-input__main__textarea-and-sentences textarea');
  return textArea.value;
};

const extractBackText = () => {
  const translationSpan = querySelector(document, '.translation-input__target .text__translation');
  return translationSpan.innerText;
};

const tryToAddHook = (createHook) => {
  const translationSpan = querySelector(document, '.translation-input__target .text__translation', { throwOnUnfound: false });
  const optionBar = querySelector(document, '.translation-input__target .options', { throwOnUnfound: false });
  if (!(translationSpan && optionBar)) {
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
  highlightOnHookHover(hook, translationSpan, 'lightblue');
  optionBar.prepend(hook);
};


export default (createHook) => {
  setInterval(() => {
    tryToAddHook(createHook);
  }, 500);
};
