import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll } from '../../helpers/scraping';


const extractFrontText = parentNode =>
  stringifyNodeWithStyle(querySelector(parentNode, 'td.src'));

const extractBackText = parentNode =>
  stringifyNodeWithStyle(querySelector(parentNode, 'td.tgt'));


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export const run = (createHook) => {
  querySelectorAll(document, '#ctxBody tr', { throwOnUnfound: false })

    .filter(
      trNode =>
        // The first row is often empty, we take only those with a td.src inside
        querySelector(trNode, 'td.src', { throwOnUnfound: false })
    )
    .forEach((trNode) => {
      const hook = createHook({ type: 'contextualDictionary', data: trNode });
      hook.style.position = 'absolute';
      hook.style.top = '3px';
      hook.style.right = '-80px';
      highlightOnHookHover(hook, trNode, 'lightblue');
      const parentNode = querySelector(trNode, 'td:last-child');
      parentNode.style.position = 'relative';
      parentNode.append(hook);
    });
};
