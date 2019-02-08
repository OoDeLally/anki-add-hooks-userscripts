export default (message) => {
  const error = Error(message);
  error.name = 'ScrappingError';
  error.location = window.location;
  error.stack = error.stack.split(/[\n\r]/gm).slice(4).join('\n');
  return error;
};
