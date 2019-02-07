import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { ANKI_ADD_BUTTON_CLASS_SELECTOR } from '../../constants';


export const extract = (parentTr) => {
  const [sourceTd, targetTd] = parentTr.querySelectorAll('td');
  return {
    frontText: sourceTd.innerText,
    backText: targetTd.innerText,
  };
};


const tryAddingToRow = (parentTr, createHook) => {
  const [, , actionTd] = parentTr.querySelectorAll('td');
  const existingHook = actionTd.querySelector(ANKI_ADD_BUTTON_CLASS_SELECTOR);
  if (existingHook) {
    return; // Hook already exists
  }
  const hook = createHook({ type: 'secondaryPanel', parentNode: parentTr });
  hook.style.display = 'inline-block';
  hook.style.marginLeft = '5px';
  highlightOnHookHover(hook, parentTr, '#d2e3fc');
  actionTd.querySelector('.gt-baf-cell').append(hook);
};


export const run = (createHook) => {
  document.querySelectorAll('.gt-baf-table tr.gt-baf-entry')
    .forEach(tr => tryAddingToRow(tr, createHook));
};
