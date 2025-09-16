const { Client } = require('@line/bot-sdk');

class LineClient {
  constructor(channelAccessToken) {
    this.client = new Client({
      channelAccessToken: channelAccessToken
    });
  }

  async replyMessage(replyToken, message) {
    try {
      return await this.client.replyMessage(replyToken, message);
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  createTextMessage(text) {
    return {
      type: 'text',
      text: text
    };
  }

  async createStockMessage(ticker, stockApiKey) {
    try {
      // Call Foo Vantage API for real stock data
      const stockData = await this.fetchStockData(ticker, stockApiKey);
      
      if (!stockData) {
        return this.createTextMessage(`❌ Stock ticker "${ticker}" not found.\n\nTry: /stock AAPL, /stock TSLA, /stock MSFT`);
      }

      const {
        symbol,
        companyName,
        price,
        change,
        changePercent,
        volume,
        high,
        low,
        lastUpdated,
        isMarketOpen
      } = stockData;

      const changeSign = change >= 0 ? '+' : '';
      const changeEmoji = change >= 0 ? '📈' : '📉';
      const marketStatus = isMarketOpen ? '🟢 Market Open' : '🔴 Market Closed';

      return this.createTextMessage(
        `${changeEmoji} ${symbol} - ${companyName}\n` +
        `💰 $${price} (${changeSign}${change} ${changeSign}${changePercent}%)\n` +
        `📊 Vol: ${this.formatVolume(volume)} | High: $${high} | Low: $${low}\n` +
        `${marketStatus} | Updated: ${lastUpdated}`
      );

    } catch (error) {
      console.error('Error fetching stock data:', error);
      
      // Fallback to dummy data with error message
      const currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return this.createTextMessage(
        `⚠️ Unable to fetch live data for ${ticker.toUpperCase()}\n\n` +
        `📈 ${ticker.toUpperCase()} - Sample Company Inc.\n` +
        `💰 $150.25 (+2.15 +1.45%)\n` +
        `📅 ${currentTime} EST (Demo data)\n\n` +
        `Please try again later or check if ticker is valid.`
      );
    }
  }

  async fetchStockData(ticker, apiKey) {
    const https = require('https');
    
    // Use Finnhub API for real-time stock quotes
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            console.log('Raw Finnhub API response:', data);
            const response = JSON.parse(data);
            console.log('Parsed Finnhub response:', JSON.stringify(response, null, 2));
            
            // Check for API errors or invalid response
            if (response.error || !response.c) {
              console.error('Finnhub API error or no data:', response);
              resolve(null);
              return;
            }

            // Finnhub response format: {c: current_price, d: change, dp: change_percent, h: high, l: low, o: open, pc: previous_close, t: timestamp}
            const currentPrice = response.c;
            const change = response.d;
            const changePercent = response.dp;
            const high = response.h;
            const low = response.l;
            const previousClose = response.pc;
            const timestamp = response.t;

            if (!currentPrice || currentPrice === 0) {
              console.error('Invalid stock data for', ticker);
              resolve(null);
              return;
            }

            // Format the data
            const price = parseFloat(currentPrice).toFixed(2);
            const changeFormatted = parseFloat(change).toFixed(2);
            const changePercentFormatted = parseFloat(changePercent).toFixed(2);
            const highFormatted = parseFloat(high).toFixed(2);
            const lowFormatted = parseFloat(low).toFixed(2);

            // Format last updated time
            const lastUpdated = new Date(timestamp * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // Simple market hours check (US Eastern Time)
            const now = new Date();
            const usTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
            const hour = usTime.getHours();
            const day = usTime.getDay();
            const isWeekday = day >= 1 && day <= 5;
            const isMarketHours = hour >= 9 && hour < 16;
            const isMarketOpen = isWeekday && isMarketHours;

            // For volume, we'll need to make a separate call to get daily stats
            // For now, we'll omit volume from the response
            resolve({
              symbol: ticker.toUpperCase(),
              companyName: this.getCompanyName(ticker.toUpperCase()),
              price: price,
              change: changeFormatted,
              changePercent: changePercentFormatted,
              volume: 'N/A', // Finnhub basic quote doesn't include volume
              high: highFormatted,
              low: lowFormatted,
              lastUpdated: lastUpdated,
              isMarketOpen: isMarketOpen
            });

          } catch (parseError) {
            console.error('Error parsing Finnhub data:', parseError);
            reject(parseError);
          }
        });
      }).on('error', (error) => {
        console.error('HTTP request error:', error);
        reject(error);
      });
    });
  }

  formatVolume(volume) {
    const num = parseInt(volume.replace(/,/g, ''));
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return volume;
  }

  getCompanyName(symbol) {
    // Simple lookup for common stocks - could be enhanced with a proper API
    const companies = {
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix Inc.',
      'AMD': 'Advanced Micro Devices',
      'INTC': 'Intel Corporation',
      'BABA': 'Alibaba Group',
      'DIS': 'The Walt Disney Company',
      'V': 'Visa Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson'
    };
    
    return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`;
  }

  createHelpMessage() {
    return this.createTextMessage(
      `🤖 Foo's Bot - Real-Time Prices for Fake people\n\n` +
      `📈 /stock PLTR - Parantir.\n` +
      `📈 /stock UNH - United Heart Care.\n` +
      `📈 /stock NVDA - NoobVidea\n` +
      `📈 /stock GOOGL - Alphabet\n` +
      `❓ /help - Show this help\n\n` +
      `💡 Supports all US stocks (NYSE, NASDAQ)\n` +
      `🟢 Real-time data powered by Finnhub\n\n` +
      `Try: /stock NVDA`
    );
  }

  createUnknownCommandMessage() {
    return this.createTextMessage(
      `❓ Unknown command. Try:\n` +
      `/stock AAPL - Get stock price\n` +
      `/help - Show help`
    );
  }
}

module.exports = LineClient;