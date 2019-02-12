import { querySelector } from '../../helpers/scraping';

export const getSourceLanguage = () =>
  querySelector(document, '.sl-sugg .jfk-button-checked').innerText.split(/ *- */)[0];

export const getTargetLanguage = () =>
  querySelector(document, '.tl-sugg .jfk-button-checked').innerText;
