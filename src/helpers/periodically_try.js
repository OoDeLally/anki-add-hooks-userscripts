import onScrapingError from '../on_scraping_error';

// Periodically try to run runCallback(). Stops if an error is thrown.
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
