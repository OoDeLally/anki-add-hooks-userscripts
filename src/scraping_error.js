export default (message) => {
  const error = Error(message);
  error.name = 'ScrapingError';
  error.location = window.location;
  return error;
};
