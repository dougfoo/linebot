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

  createStockMessage(ticker) {
    // Dummy stock data for Phase 1
    const currentTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const price = (Math.random() * 200 + 50).toFixed(2);
    const change = (Math.random() * 10 - 5).toFixed(2);
    const changePercent = (change / price * 100).toFixed(2);
    const changeSign = change >= 0 ? '+' : '';

    return this.createTextMessage(
      `📈 ${ticker.toUpperCase()} - Sample Company Inc.\n` +
      `💰 $${price} (${changeSign}${change} ${changeSign}${changePercent}%)\n` +
      `📅 Last updated: ${currentTime} EST\n` +
      `\n⚠️ This is dummy data for testing`
    );
  }

  createHelpMessage() {
    return this.createTextMessage(
      `🤖 Stock Bot Commands:\n\n` +
      `📈 /stock AAPL - Get stock price\n` +
      `📈 /stock TSLA - Get Tesla stock\n` +
      `❓ /help - Show this help\n\n` +
      `Try: /stock AAPL`
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