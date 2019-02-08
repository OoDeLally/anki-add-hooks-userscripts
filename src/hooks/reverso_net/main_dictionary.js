import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { getNodeWithIdMatchingRegExp } from '../../helpers/get_nodes_with_id_matching_reg_exp';


const extractFrontText = () => {
  const sourceWord = getNodeWithIdMatchingRegExp(/_lblEntry$/);
  return stringifyNodeWithStyle(sourceWord);
};

const extractBackText = () => {
  const targetWord = getNodeWithIdMatchingRegExp(/_lblTranslation$/);
  return stringifyNodeWithStyle(targetWord);
};


export const extract = divGroup => ({
  frontText: extractFrontText(divGroup),
  backText: extractBackText(divGroup),
});


export const run = (createHook) => {
  const resultBox = document.querySelector('.center_frameColl');
  if (!resultBox) {
    return;
  }
  const hook = createHook({ type: 'mainDictionary', data: resultBox });
  hook.style.position = 'absolute';
  hook.style.right = '100px';
  hook.style.top = '5px';
  highlightOnHookHover(hook, resultBox, 'lightblue');
  resultBox.style.position = 'relative';
  resultBox.append(hook);
};
