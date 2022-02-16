import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, } from '../../helpers/scraping';
import ScrapingError from '../../scraping_error';

// e.g. https://context.reverso.net/traduction/anglais-francais/hello


const getLanguages = () => {
  const match = window.location.href.match(/reverso\.net\/(\w+\/)?([a-z]+)-([a-z]+)\//);
  if (!match) {
    throw ScrapingError('Could not extract languages from url');
  }
  const [,, sourceLanguage, targetLanguage] = match;
  if (!sourceLanguage || !targetLanguage) {
    throw ScrapingError('Could not extract languages from url');
  }
  return [sourceLanguage, targetLanguage];
};

const extractFrontText = containerDiv =>
  stringifyNodeWithStyle(querySelector(containerDiv, '.src > .text'));

const extractBackText = containerDiv =>
  stringifyNodeWithStyle(querySelector(containerDiv, '.trg > .text'));


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
      hook.style.position = 'relative';
      hook.style.top = 'auto';
      hook.style.float = 'right';
      highlightOnHookHover(hook, containerDiv, 'lightblue');
      containerDiv.querySelector('.options .trg').prepend(hook);
    });
};
