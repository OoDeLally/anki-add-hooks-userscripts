import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import { ANKI_ADD_BUTTON_CLASS_SELECTOR } from '../../constants';


const frontFieldSelector = 'textarea#source';
const backFieldSelector = '.translation';


export const extract = () => ({
  frontText: document.querySelector(frontFieldSelector).value,
  backText: document.querySelector(backFieldSelector).innerText,
});


export const run = (createHook) => {
  const containerBlock = document.querySelector('.source-target-row');
  const parentNode = containerBlock.querySelector('.result-footer');
  if (!parentNode) {
    return; // Container not found
  }
  const existingHook = parentNode.querySelector(ANKI_ADD_BUTTON_CLASS_SELECTOR);
  if (existingHook) {
    return; // Hook already exists
  }
  const children = Array.from(parentNode.childNodes);
  const firstFloatLeftNode = children.find(node => node.style.float === 'left');
  const hook = createHook({ type: 'mainPanel' });
  hook.style.float = 'right';
  hook.style.top = '15px';
  hook.style.right = '10px';
  highlightOnHookHover(hook, containerBlock.querySelectorAll(`${frontFieldSelector},${backFieldSelector}`), '#d2e3fc');
  parentNode.insertBefore(hook, firstFloatLeftNode);
};
