import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import getNodesWithIdMatchingRegExp from '../../helpers/get_nodes_with_id_matching_reg_exp';


const extractFrontText = () => {
  const sourceWords = getNodesWithIdMatchingRegExp(/_lblEntry$/);
  if (sourceWords.length > 2) {
    throw Error(`Pattern matches ${sourceWords.length} nodes`);
  }
  const sourceWord = sourceWords[0];
  if (!sourceWord) {
    throw Error('Front text not found from selector');
  }
  return stringifyNodeWithStyle(sourceWord);
};

const extractBackText = () => {
  const targetWords = getNodesWithIdMatchingRegExp(/_lblTranslation$/);
  if (targetWords.length > 2) {
    throw Error(`Pattern matches ${targetWords.length} nodes`);
  }
  const targetWord = targetWords[0];
  if (!targetWord) {
    throw Error('Back text not found from selector');
  }
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
