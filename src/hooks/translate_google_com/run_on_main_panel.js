import { doesAnkiHookExistIn } from '../../helpers/scraping';
import { getSourceLanguage, getTargetLanguage } from './get_languages';
import { findFirstCommonAncester } from '../../helpers/find_first_common_ancester';


const findFooterButton = innerText =>
  Array.from(document.querySelectorAll('i.material-icons-extended'))
    .find(i => i.innerText === innerText) || null;

const findButtonFooter = () => {
  // Since Google Translate uses cyphered class names,
  // this function relies on the presence of a "copy" button.
  const copyButtonIcon = findFooterButton('content_copy');
  if (!copyButtonIcon) {
    return null;
  }
  const shareButtonIcon = findFooterButton('share');
  if (!shareButtonIcon) {
    return null;
  }
  return findFirstCommonAncester([copyButtonIcon, shareButtonIcon]);
};

export default (createHook) => {
  const footerNode = findButtonFooter();
  if (!footerNode) {
    return;
  }
  if (doesAnkiHookExistIn(footerNode)) {
    return;
  }

  const containerNode = footerNode.parentNode;
  if (!containerNode) {
    return;
  }

  const sourceTextNode = document.querySelector('span[lang] textarea');
  if (!sourceTextNode) {
    return;
  }

  const traductionContainer = containerNode.children[0];
  if (!traductionContainer) {
    return;
  }
  const traductionNode = traductionContainer.children[0];
  if (!traductionNode) {
    return;
  }

  const hook = createHook(() => {
    const sourceLanguage = getSourceLanguage();
    const targetLanguage = getTargetLanguage();
    return {
      frontText: sourceTextNode.value,
      backText: traductionNode.innerText,
      frontLanguage: sourceLanguage,
      backLanguage: targetLanguage,
      cardKind: `${sourceLanguage} -> ${targetLanguage}`,
    };
  });
  hook.style.top = '15px';
  hook.style.left = '5px';
  footerNode.appendChild(hook);
};
