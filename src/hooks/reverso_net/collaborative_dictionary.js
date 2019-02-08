import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';


const extractFrontText = parentNode =>
  stringifyNodeWithStyle(parentNode.querySelector('.CDResSource'));

const extractBackText = parentNode =>
  stringifyNodeWithStyle(parentNode.querySelector('.CDResTarget'));


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export const run = (createHook) => {
  const collaborativeDefinitionsRows = Array.from(document.querySelectorAll('.CDResTable tr'))
    .filter(tr => tr.getAttribute('valign') === 'top');
  collaborativeDefinitionsRows.forEach((rowNode) => {
    const hook = createHook({ type: 'collaborativeDictionary', data: rowNode });
    hook.style.position = 'absolute';
    hook.style.left = '105px';
    highlightOnHookHover(hook, rowNode, 'lightblue');
    const parentNode = rowNode.querySelector('.CDResAct');
    parentNode.style.position = 'relative';
    parentNode.append(hook);
  });
};
