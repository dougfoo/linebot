function validateTicker(ticker) {
  if (!ticker) {
    return { valid: false, error: 'Ticker symbol is required' };
  }

  // Basic ticker validation - letters only, 1-5 characters
  const tickerRegex = /^[A-Za-z]{1,5}$/;
  if (!tickerRegex.test(ticker)) {
    return { 
      valid: false, 
      error: 'Invalid ticker format. Use 1-5 letters (e.g., AAPL, TSLA)' 
    };
  }

  return { valid: true };
}

function parseStockCommand(text) {
  // Parse "/stock AAPL" format
  const parts = text.trim().split(/\s+/);
  
  if (parts.length < 2) {
    return { 
      valid: false, 
      error: 'Usage: /stock <ticker>\nExample: /stock AAPL' 
    };
  }

  const ticker = parts[1];
  const validation = validateTicker(ticker);
  
  if (!validation.valid) {
    return validation;
  }

  return {
    valid: true,
    ticker: ticker.toUpperCase()
  };
}

function parseCommand(text) {
  if (!text || typeof text !== 'string') {
    return { command: null };
  }

  const trimmed = text.trim().toLowerCase();
  
  // Only respond to slash commands
  if (!trimmed.startsWith('/')) {
    return { command: 'ignore' };
  }
  
  if (trimmed.startsWith('/stock')) {
    return {
      command: 'stock',
      original: text
    };
  }
  
  if (trimmed === '/help') {
    return {
      command: 'help'
    };
  }

  return {
    command: 'unknown',
    original: text
  };
}

module.exports = {
  validateTicker,
  parseStockCommand,
  parseCommand
};