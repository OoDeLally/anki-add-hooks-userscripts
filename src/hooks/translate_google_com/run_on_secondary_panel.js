import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import { getSourceLanguage, getTargetLanguage } from './get_languages';


const tryAddingToRow = (parentTr, createHook) => {
  let sourceText;
  let targetText;
  let actionContainer;
  const { children } = parentTr;
  if (children.length === 3) {
    [sourceText, targetText, actionContainer] = children;
  } else if (children.length === 4) {
    [, sourceText, targetText, actionContainer] = children;
  } else {
    return;
  }

  if (doesAnkiHookExistIn(actionContainer)) {
    return;
  }
  const hook = createHook(() => {
    // The secondary panel proposes reverse translations
    const targetLanguage = getSourceLanguage();
    const sourceLanguage = getTargetLanguage();
    return {
      frontText: sourceText.innerText,
      backText: targetText.innerText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.position = 'absolute';
  hook.style.top = '5px';
  hook.style.right = '50px';
  highlightOnHookHover(hook, parentTr, '#d2e3fc');
  actionContainer.style.position = 'relative';
  actionContainer.prepend(hook);
};


export default (createHook) => {
  querySelectorAll(document, 'tbody tr', { throwOnUnfound: false })
    .filter(tr => tr.children.length >= 3 && tr.children.length <= 4)
    .forEach(tr => tryAddingToRow(tr, createHook, getSourceLanguage, getTargetLanguage));
};
