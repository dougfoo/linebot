const functions = require('@google-cloud/functions-framework');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const crypto = require('crypto');

// Import our shared modules
const LineClient = require('./lineClient');
const { parseCommand, parseStockCommand } = require('./validators');

// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient();

// Cache for secrets to avoid repeated API calls
let secretsCache = {};

async function getSecret(secretName) {
  if (secretsCache[secretName]) {
    return secretsCache[secretName];
  }

  try {
    const projectId = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    
    const [version] = await secretClient.accessSecretVersion({ name });
    const secret = version.payload.data.toString();
    
    // Cache the secret
    secretsCache[secretName] = secret;
    return secret;
  } catch (error) {
    console.error(`Error getting secret ${secretName}:`, error);
    throw error;
  }
}

function validateLineSignature(body, signature, channelSecret) {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}

async function handleTextMessage(message, replyToken, lineClient) {
  const text = message.text;
  const command = parseCommand(text);

  console.log('Received command:', command);

  switch (command.command) {
    case 'stock':
      const stockParse = parseStockCommand(text);
      if (!stockParse.valid) {
        return lineClient.createTextMessage(`❌ ${stockParse.error}`);
      }
      return lineClient.createStockMessage(stockParse.ticker);

    case 'help':
      return lineClient.createHelpMessage();

    case 'unknown':
    default:
      return lineClient.createUnknownCommandMessage();
  }
}

// Main Cloud Function handler
functions.http('webhook', async (req, res) => {
  console.log('Webhook called:', {
    method: req.method,
    headers: req.headers,
    body: typeof req.body
  });

  // Handle LINE webhook verification (GET request)
  if (req.method === 'GET') {
    res.status(200).send('LINE Bot Webhook is ready');
    return;
  }

  // Only accept POST requests for webhook events
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Get LINE credentials from Secret Manager
    const [channelSecret, channelAccessToken] = await Promise.all([
      getSecret('line-channel-secret'),
      getSecret('line-channel-access-token')
    ]);

    // Validate LINE signature
    const signature = req.headers['x-line-signature'];
    const body = JSON.stringify(req.body);
    
    if (!validateLineSignature(body, signature, channelSecret)) {
      console.error('Invalid signature');
      res.status(401).send('Unauthorized');
      return;
    }

    // Initialize LINE client
    const lineClient = new LineClient(channelAccessToken);

    // Process LINE events
    const events = req.body.events || [];
    console.log(`Processing ${events.length} events`);

    for (const event of events) {
      console.log('Event type:', event.type);

      if (event.type === 'message' && event.message.type === 'text') {
        try {
          const responseMessage = await handleTextMessage(
            event.message, 
            event.replyToken, 
            lineClient
          );

          await lineClient.replyMessage(event.replyToken, responseMessage);
          console.log('Reply sent successfully');
        } catch (error) {
          console.error('Error handling message:', error);
          
          // Send error message to user
          try {
            const errorMessage = lineClient.createTextMessage(
              '❌ Sorry, something went wrong. Please try again.'
            );
            await lineClient.replyMessage(event.replyToken, errorMessage);
          } catch (replyError) {
            console.error('Error sending error message:', replyError);
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});