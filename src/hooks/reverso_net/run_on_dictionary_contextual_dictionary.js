import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll } from '../../helpers/scraping';
import getLanguages from './get_languages';

// e.g. https://dictionnaire.reverso.net/francais-anglais/hello
//        Table on the bottom with a few examples.

const extractFrontText = trNode =>
  stringifyNodeWithStyle(querySelector(trNode, 'td.src'));

const extractBackText = trNode =>
  stringifyNodeWithStyle(querySelector(trNode, 'td.tgt'));


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export default (createHook) => {
  querySelectorAll(document, '#ctxBody tr', { throwOnUnfound: false })
    .filter(
      trNode =>
        // The first row is often empty, we take only those with a td.src inside
        querySelector(trNode, 'td.src', { throwOnUnfound: false })
    )
    .forEach((trNode) => {
      const hook = createHook(() => {
        const [sourceLanguage, targetLanguage] = getLanguages();
        return {
          frontText: extractFrontText(trNode),
          backText: extractBackText(trNode),
          frontLanguage: sourceLanguage,
          backLanguage: targetLanguage,
          cardKind: `${sourceLanguage} -> ${targetLanguage}`,
        };
      });
      hook.style.position = 'absolute';
      hook.style.top = '3px';
      hook.style.right = '-80px';
      highlightOnHookHover(hook, trNode, 'lightblue');
      const parentNode = querySelector(trNode, 'td:last-child');
      parentNode.style.position = 'relative';
      parentNode.append(hook);
    });
};
