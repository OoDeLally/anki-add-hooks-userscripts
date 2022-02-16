import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll } from '../../helpers/scraping';
import getLanguages from './get_languages';


const extractFrontText = row =>
  stringifyNodeWithStyle(querySelector(row, '.CDResSource'));

const extractBackText = row =>
  stringifyNodeWithStyle(querySelector(row, '.CDResTarget'));


const extractCallBack = (row, reverseDirection) => {
  let sourceLanguage;
  let targetLanguage;
  if (reverseDirection) {
    [targetLanguage, sourceLanguage] = getLanguages();
  } else {
    [sourceLanguage, targetLanguage] = getLanguages();
  }
  return {
    frontText: extractFrontText(row),
    backText: extractBackText(row),
    frontLanguage: sourceLanguage,
    backLanguage: targetLanguage,
    cardKind: `${sourceLanguage} -> ${targetLanguage}`,
  };
};


export default (createHook) => {
  const allRows = querySelectorAll(document, '.CDResTable tr', { throwOnUnfound: false });
  const reverseDirectionRows = querySelectorAll(
    document,
    '#ctl00_cC_ucResPM_opossiteEntries tr',
    { throwOnUnfound: false }
  )
    .filter(tr => tr.getAttribute('valign') === 'top');
  const normalRows = allRows.filter(tr => !reverseDirectionRows.includes(tr))
    .filter(tr => tr.getAttribute('valign') === 'top');
  [
    { rows: normalRows, reverseDirection: false },
    { rows: reverseDirectionRows, reverseDirection: true }
  ]
    .forEach(({ rows, reverseDirection }) => {
      rows.forEach((row) => {
        const hook = createHook(() => extractCallBack(row, reverseDirection));
        hook.style.position = 'absolute';
        hook.style.left = '110px';
        highlightOnHookHover(hook, row, 'lightblue');
        const parentNode = querySelector(row, '.CDResAct');
        parentNode.style.position = 'relative';
        parentNode.append(hook);
      });
    });
};
