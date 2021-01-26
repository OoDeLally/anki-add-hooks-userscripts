
const getUrlParameter = (name) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name);
};

export const getSourceLanguage = () =>
  getUrlParameter('sl');

export const getTargetLanguage = () =>
  getUrlParameter('tl');
