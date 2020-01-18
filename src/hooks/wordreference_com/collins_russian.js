import stringifyNodeWithStyle from '../../helpers/stringify_node_with_style';
import { querySelector } from '../../helpers/scraping';


export const runOnCollinsRussian = (createHook, sourceLanguage, targetLanguage) => {
  const articleDiv = querySelector(document, '#article', { throwOnUnfound: false });
  if (!articleDiv) {
    return;
  }

  const frontElements = [];

  let childIndex = 0;
  const children = Array.from(articleDiv.childNodes);

  // Iterate through the articleDiv's children.
  // Assumed syntax:
  //  (junk) .hw .phonetics (.ps .IN a)+ #enrufootnote

  while (childIndex < children.length) {
    // Skip until we find hw.
    const child = children[childIndex];
    childIndex++;
    if (/\bhw\b/.test(child.className)) {
      frontElements.push(child);
      break;
    }
  }

  while (childIndex < children.length) {
    // Push everything to `frontElements` we find until we find .ps.
    const child = children[childIndex];
    if (/\bps\b/.test(child.className)) {
      break;
    } else {
      frontElements.push(child);
      childIndex++;
    }
  }
  if (frontElements.length === 0) {
    return; // Didnt find anything.
  }
  const allDefinitions = [];
  let currentDefinitionElements = [children[childIndex]];
  childIndex++;
  while (childIndex < children.length) {
    // Push everything to `currentDefinitionElements` that
    // we find until we find another .ps or #enrufootnote.
    const child = children[childIndex];
    if (new RegExp(`\\b${sourceLanguage}${targetLanguage}footnote\\b`).test(child.id)) {
      break;
    }
    if (/\bps\b/.test(child.className)) {
      if (currentDefinitionElements.length > 0) {
        allDefinitions.push(currentDefinitionElements);
      }
      currentDefinitionElements = [child];
    } else {
      currentDefinitionElements.push(child);
    }
    childIndex++;
  }
  if (currentDefinitionElements.length > 0) {
    allDefinitions.push(currentDefinitionElements);
  }

  if (allDefinitions.length === 0) {
    return; // Didnt find anything.
  }

  // Create the hook.
  articleDiv.style.position = 'relative';
  const hook = createHook(() => ({
    frontText: stringifyNodeWithStyle(frontElements),
    backText: stringifyNodeWithStyle(
      allDefinitions.map((definitionElements, definitionIndex) => {
        if (definitionIndex < allDefinitions.length) {
          return [...definitionElements, document.createElement('BR')];
        } else {
          return definitionElements;
        }
      })
        .flat()
    ),
    frontLanguage: sourceLanguage,
    backLanguage: targetLanguage,
    cardKind: `${sourceLanguage} -> ${targetLanguage}`,
  }));
  hook.style.position = 'absolute';
  hook.style.right = '20px';
  articleDiv.prepend(hook);
};
