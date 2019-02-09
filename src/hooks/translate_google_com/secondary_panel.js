import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';


export const extract = (parentTr) => {
  const [sourceTd, targetTd] = querySelectorAll(parentTr, 'td');
  return {
    frontText: sourceTd.innerText,
    backText: targetTd.innerText,
  };
};


const tryAddingToRow = (parentTr, createHook) => {
  const [, , actionTd] = querySelectorAll(parentTr, 'td');
  if (doesAnkiHookExistIn(actionTd)) {
    return;
  }
  const hook = createHook({ type: 'secondaryPanel', parentNode: parentTr });
  hook.style.display = 'inline-block';
  hook.style.marginLeft = '5px';
  highlightOnHookHover(hook, parentTr, '#d2e3fc');
  querySelector(actionTd, '.gt-baf-cell').append(hook);
};


export const run = (createHook) => {
  querySelectorAll(document, '.gt-baf-table tr.gt-baf-entry')
    .forEach(tr => tryAddingToRow(tr, createHook));
};
