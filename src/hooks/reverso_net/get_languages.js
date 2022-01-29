import ScrapingError from '../../scraping_error';

export default () => {
  const match = window.location.hash.match(/\bsl=(\w+)&tl=(\w+)/);
  if (!match) {
    throw ScrapingError('Could not extract languages from url');
  }
  const [, sourceLanguage, targetLanguage] = match;
  if (!sourceLanguage || !targetLanguage) {
    throw ScrapingError('Could not extract languages from url');
  }
  return [sourceLanguage, targetLanguage];
};
