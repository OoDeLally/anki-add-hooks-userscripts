import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import { getSourceLanguage, getTargetLanguage } from './get_languages';


const frontFieldSelector = 'textarea#source';
const backFieldSelector = '.translation';


export default (createHook) => {
  const containerBlock = querySelector(document, '.source-target-row');
  const parentNode = querySelector(containerBlock, '.result-footer', { throwOnUnfound: false });
  if (!parentNode) {
    return;
  }
  if (doesAnkiHookExistIn(parentNode)) {
    return;
  }
  const children = Array.from(parentNode.childNodes);
  const firstFloatLeftNode = children.find(node => node.style.float === 'left');
  const hook = createHook(() => {
    const sourceLanguage = getSourceLanguage();
    const targetLanguage = getTargetLanguage();
    return {
      frontText: querySelector(document, frontFieldSelector).value,
      backText: querySelector(document, backFieldSelector).innerText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.float = 'right';
  hook.style.top = '15px';
  hook.style.right = '10px';
  const frontAndBackFields = querySelectorAll(containerBlock, `${frontFieldSelector},${backFieldSelector}`);
  highlightOnHookHover(hook, frontAndBackFields, '#d2e3fc');
  parentNode.insertBefore(hook, firstFloatLeftNode);
};
