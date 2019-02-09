import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll } from '../../helpers/scraping';


const extractFrontText = row =>
  stringifyNodeWithStyle(querySelector(row, '.CDResSource'));

const extractBackText = row =>
  stringifyNodeWithStyle(querySelector(row, '.CDResTarget'));


export const extract = ({ row, reverseDirection }) => ({
  frontText: extractFrontText(row),
  backText: extractBackText(row),
  reverseDirection,
});


export const run = (createHook) => {
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
        const hook = createHook({ type: 'collaborativeDictionary', data: { row, reverseDirection } });
        hook.style.position = 'absolute';
        hook.style.left = '105px';
        highlightOnHookHover(hook, row, 'lightblue');
        const parentNode = querySelector(row, '.CDResAct');
        parentNode.style.position = 'relative';
        parentNode.append(hook);
      });
    });
};
