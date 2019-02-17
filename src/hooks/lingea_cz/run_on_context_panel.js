
import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import extractCardKind from './extract_card_kind';
import dropWTags from './drop_w_tags';
import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import showHookOnZoneHover from '../../helpers/show_hook_on_zone_hover';


const runOnRowNode = (rowNode, createHook) => {
  if (doesAnkiHookExistIn(rowNode)) {
    return;
  }
  const hook = createHook(() => ({
    frontText: stringifyNodeWithStyle(querySelector(rowNode, '.lex_ftx_samp2s'), dropWTags),
    backText: stringifyNodeWithStyle(querySelector(rowNode, '.lex_ftx_samp2t'), dropWTags),
    frontLanguage: null,
    backLanguage: null,
    cardKind: `${extractCardKind()} Contextual`,
  }));
  hook.style.position = 'absolute';
  hook.style.right = '-70px';
  const parentNode = querySelector(rowNode, 'td:last-child');
  highlightOnHookHover(hook, rowNode, 'lightblue');
  showHookOnZoneHover(hook, rowNode);
  parentNode.style.position = 'relative';
  parentNode.prepend(hook);
};


export default (createHook) => {
  querySelectorAll(document, '.fulltext tr', { throwOnUnfound: false })
    .forEach(rowNode => runOnRowNode(rowNode, createHook));
};
