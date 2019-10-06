import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll } from '../../helpers/scraping';
import getLanguages from './get_languages';

// e.g. https://context.reverso.net/traduction/anglais-francais/hello

const extractFrontText = containerDiv =>
  stringifyNodeWithStyle(querySelector(containerDiv, '.src.ltr > .text'));

const extractBackText = containerDiv =>
  stringifyNodeWithStyle(querySelector(containerDiv, '.trg.ltr > .text'));


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export default (createHook) => {
  querySelectorAll(document, '.example', { throwOnUnfound: false })
    .forEach((containerDiv) => {
      const hook = createHook(() => {
        const [sourceLanguage, targetLanguage] = getLanguages();
        return {
          frontText: extractFrontText(containerDiv),
          backText: extractBackText(containerDiv),
          frontLanguage: sourceLanguage,
          backLanguage: targetLanguage,
          cardKind: `${sourceLanguage} -> ${targetLanguage}`,
        };
      });
      hook.style.float = 'right';
      highlightOnHookHover(hook, containerDiv, 'lightblue');
      containerDiv.style.position = 'relative';
      containerDiv.querySelector('.options .trg').prepend(hook);
    });
};
