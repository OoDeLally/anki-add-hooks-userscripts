import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector, querySelectorAll, doesAnkiHookExistIn } from '../../helpers/scraping';
import extractCardKind from './extract_card_kind';
import dropWTags from './drop_w_tags';
import replaceCommaByLinebreak from './replace_comma_by_linebreak';
import ScrapingError from '../../scraping_error';
import highlightOnHookHover from '../../helpers/highlight_on_hook_hover';
import showHookOnZoneHover from '../../helpers/show_hook_on_zone_hover';
import composeFunctions from '../../helpers/compose_functions';
import findFirstAncestor from '../../helpers/find_first_ancestor';

const runOnTd = (titleSpanNode, createHook) => {
  const parentTdNode = findFirstAncestor(titleSpanNode, node => node.nodeName === 'TD');
  if (!parentTdNode) {
    throw ScrapingError('Could not find parent TD of .lex_ful_phrs');
  }
  if (doesAnkiHookExistIn(parentTdNode)) {
    return;
  }

  const frontElementsHtml = [
    stringifyNodeWithStyle(
      titleSpanNode,
      dropWTags
    )
  ];
  const backElementsHtml = [];
  const translationSpanNode = querySelector(parentTdNode, '.lex_ful_tran', { throwOnUnfound: false });
  if (translationSpanNode) {
    backElementsHtml.push(
      stringifyNodeWithStyle(
        translationSpanNode,
        composeFunctions(dropWTags, replaceCommaByLinebreak)
      )
    );
  }

  // Sample phrases?
  querySelectorAll(parentTdNode, '.lex_ful_samp2', { throwOnUnfound: false })
    .forEach((sampleNode) => {
      frontElementsHtml.push('<br/><br/>');
      frontElementsHtml.push(
        stringifyNodeWithStyle(
          querySelector(sampleNode, '.lex_ful_samp2s'),
          dropWTags
        )
      );
      backElementsHtml.push('<br/><br/>');
      backElementsHtml.push(
        stringifyNodeWithStyle(
          querySelector(sampleNode, '.lex_ful_samp2t'),
          dropWTags
        )
      );
    });

  const hook = createHook(() => ({
    frontText: frontElementsHtml.join(''),
    backText: backElementsHtml.join(''),
    frontLanguage: null,
    backLanguage: null,
    cardKind: `${extractCardKind()} Secondary Term`,
  }));
  hook.style.position = 'absolute';
  hook.style.right = '0px';
  highlightOnHookHover(hook, parentTdNode, 'lightblue');
  showHookOnZoneHover(hook, parentTdNode);
  parentTdNode.style.position = 'relative';
  parentTdNode.prepend(hook);
};


export default (createHook) => {
  querySelectorAll(document, '.lex_ful_phrs', { throwOnUnfound: false })
    .forEach(titleSpanNode => runOnTd(titleSpanNode, createHook));
};
