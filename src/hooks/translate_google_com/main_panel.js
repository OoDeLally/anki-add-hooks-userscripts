import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';


const frontFieldSelector = 'textarea#source';
const backFieldSelector = '.translation';


export const extract = () => {
  const frontText = document.querySelector(frontFieldSelector).value;
  const backText = document.querySelector(backFieldSelector).innerText;
  return {
    frontText: `<div style="text-align:center;">${frontText}</div>`,
    backText: `<div style="text-align:center;">${backText}</div>`,
  };
};


export const run = (createHook) => {
  const containerBlock = document.querySelector('.source-target-row');
  const parentNode = containerBlock.querySelector('.result-footer');
  if (!parentNode) {
    return; // Container not found
  }
  const existingHook = parentNode.querySelector('.-anki-quick-adder-hook');
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
