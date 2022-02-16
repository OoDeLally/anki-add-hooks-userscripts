import ScrapingError from '../../scraping_error';

const getLanguageFromUrlParameters = () => {
  const match = window.location.hash.match(/\bsl=(\w+)&tl=(\w+)/);
  if (!match) {
    return null;
  }
  const [, sourceLanguage, targetLanguage] = match;
  if (!sourceLanguage || !targetLanguage) {
    return null;
  }
  return [sourceLanguage, targetLanguage];
};

const getLanguageFromUrlPath = () => {
  // e.g. https://dictionnaire.reverso.net/anglais-francais/hello
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

export default () => {
  const languages = getLanguageFromUrlParameters() || getLanguageFromUrlPath();

  if (!languages) {
    throw ScrapingError('Could not extract languages from url');
  }

  return languages;
};
