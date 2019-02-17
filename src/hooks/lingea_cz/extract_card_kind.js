export default () => {
  const match = window.location.href.match(/lingea\.cz\/(\w+-\w+)\//);
  if (!match) {
    throw Error('Failed to extract direction');
  }
  return match[1];
};
