import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import { getSourceLanguage, getTargetLanguage } from './get_languages';


const tryAddingToRow = (parentTr, createHook) => {
  const [, , actionTd] = querySelectorAll(parentTr, 'td');
  if (doesAnkiHookExistIn(actionTd)) {
    return;
  }
  const hook = createHook(() => {
    // The secondary panel proposes reverse translations
    const targetLanguage = getSourceLanguage();
    const sourceLanguage = getTargetLanguage();
    const [sourceTd, targetTd] = querySelectorAll(parentTr, 'td');
    return {
      frontText: sourceTd.innerText,
      backText: targetTd.innerText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.display = 'inline-block';
  hook.style.marginLeft = '5px';
  highlightOnHookHover(hook, parentTr, '#d2e3fc');
  querySelector(actionTd, '.gt-baf-cell').append(hook);
};


export default (createHook) => {
  querySelectorAll(document, '.gt-baf-table tr.gt-baf-entry', { throwOnUnfound: false })
    .forEach(tr => tryAddingToRow(tr, createHook, getSourceLanguage, getTargetLanguage));
};
