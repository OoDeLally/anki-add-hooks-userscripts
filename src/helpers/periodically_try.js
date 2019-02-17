import onScrapingError from '../on_scraping_error';


export default (runCallback, periodInMs = 500) => {
  const timerId = setInterval(() => {
    try {
      runCallback();
    } catch (error) {
      if (error.name === 'ScrapingError') {
        clearInterval(timerId);
        const [, ...stackLines] = error.stack.split('\n');
        error.stack = stackLines.join('\n');
        onScrapingError(error);
      } else {
        throw error;
      }
    }
  }, periodInMs);
};
