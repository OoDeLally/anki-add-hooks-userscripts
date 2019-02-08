import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';


const extractFrontText = parentNode =>
  stringifyNodeWithStyle(parentNode.querySelector('td.src'));

const extractBackText = parentNode =>
  stringifyNodeWithStyle(parentNode.querySelector('td.tgt'));


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export const run = (createHook) => {
  document.querySelectorAll('#ctxBody tr')
    .forEach((trNode) => {
      const hook = createHook({ type: 'contextualDictionary', data: trNode });
      hook.style.position = 'absolute';
      hook.style.top = '3px';
      hook.style.right = '-80px';
      highlightOnHookHover(hook, trNode, 'lightblue');
      const parentNode = trNode.querySelector('td:last-child');
      parentNode.style.position = 'relative';
      parentNode.append(hook);
    });
};
