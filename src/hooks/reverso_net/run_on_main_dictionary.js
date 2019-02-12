import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { getNodeWithIdMatchingRegExp, querySelector } from '../../helpers/scraping';
import getLanguages from './get_languages';


const extractFrontText = () => {
  const sourceWord = getNodeWithIdMatchingRegExp(/_lblEntry$/);
  return stringifyNodeWithStyle(sourceWord);
};

const extractBackText = () => {
  const targetWord = getNodeWithIdMatchingRegExp(/_lblTranslation$/);
  return stringifyNodeWithStyle(targetWord);
};


export default (createHook) => {
  const resultBox = querySelector(document, '.center_frameColl', { throwOnUnfound: false });
  if (!resultBox) {
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
  hook.style.right = '100px';
  hook.style.top = '5px';
  highlightOnHookHover(hook, resultBox, 'lightblue');
  resultBox.style.position = 'relative';
  resultBox.append(hook);
};
