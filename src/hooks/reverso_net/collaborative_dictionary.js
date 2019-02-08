import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';


const extractFrontText = row =>
  stringifyNodeWithStyle(row.querySelector('.CDResSource'));

const extractBackText = row =>
  stringifyNodeWithStyle(row.querySelector('.CDResTarget'));


export const extract = ({ row, reverseDirection }) => ({
  frontText: extractFrontText(row),
  backText: extractBackText(row),
  reverseDirection,
});


export const run = (createHook) => {
  const allRows = Array.from(document.querySelectorAll('.CDResTable tr'));
  const reverseDirectionRows = Array.from(document.querySelectorAll('#ctl00_cC_ucResPM_opossiteEntries tr'))
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
        const parentNode = row.querySelector('.CDResAct');
        parentNode.style.position = 'relative';
        parentNode.append(hook);
      });
    });
};
