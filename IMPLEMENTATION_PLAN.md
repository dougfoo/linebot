# LINE Chatbot Implementation Plan - Stock Command Focus

## Overview

This document outlines a simplified 2-phase implementation plan for building a serverless LINE chatbot on Google Cloud Platform, starting with just the `/stock` command functionality.

## Prerequisites

- Google Cloud Platform account with billing enabled
- LINE Developers account
- Node.js 18+ installed locally
- Google Cloud SDK (gcloud) installed
- Git for version control

## Phase 1: Basic /stock Command with Dummy Data

### 1.1 GCP Project Setup (Time: 20 minutes)

**Create and Configure GCP Project**:
```bash
# Create new project
gcloud projects create your-linebot-project-id

# Set as default project
gcloud config set project your-linebot-project-id

# Enable required APIs (minimal for Phase 1)
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

**Set up IAM and Service Accounts**:
```bash
# Create service account for Cloud Functions
gcloud iam service-accounts create linebot-functions \
    --display-name="LINE Bot Cloud Functions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-linebot-project-id \
    --member="serviceAccount:linebot-functions@your-linebot-project-id.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 1.2 LINE Platform Setup (Time: 20 minutes)

Follow the complete [LINE_SETUP.md](./LINE_SETUP.md) guide:
1. Create LINE Developers account
2. Create Messaging API channel
3. Configure channel settings
4. Obtain credentials (Channel Access Token, Channel Secret, Channel ID)
5. Set up initial webhook URL (placeholder for now)

### 1.3 Secret Management (Time: 10 minutes)

Store LINE credentials in Secret Manager:
```bash
# Store LINE credentials
echo "your_channel_access_token" | gcloud secrets create line-channel-access-token --data-file=-
echo "your_channel_secret" | gcloud secrets create line-channel-secret --data-file=-
echo "your_channel_id" | gcloud secrets create line-channel-id --data-file=-
```

### 1.4 Project Structure Setup (Time: 15 minutes)

Create minimal project structure for Phase 1:
```bash
mkdir -p functions/webhook
mkdir -p shared
touch functions/webhook/{index.js,package.json}
touch shared/{lineClient.js,validators.js}
touch {.env.example}
```

### 1.5 Main Webhook Function with Dummy Stock Response (Time: 60 minutes)

**Develop `functions/webhook/index.js`**:
- Basic HTTP handler for LINE webhooks
- LINE signature verification
- Command parsing for `/stock` commands
- Return dummy stock data regardless of ticker

**Key Features**:
- Validate incoming LINE webhooks
- Parse `/stock <ticker>` commands
- Return hardcoded stock response
- Handle unknown commands with help message

**Dummy Stock Response Format**:
```javascript
// Always return this for any /stock command
{
  type: 'text',
  text: `📈 ${ticker} - Sample Company Inc.\n💰 $150.25 (+2.15 +1.45%)\n📅 Last updated: ${new Date().toLocaleString()}`
}
```

**Test Locally**:
```bash
cd functions/webhook
npm install
npx functions-framework --target=webhook
# Test with ngrok for LINE webhook testing
```

### 1.6 Deploy and Test (Time: 30 minutes)

**Deploy Webhook Function**:
```bash
gcloud functions deploy line-webhook \
    --source=functions/webhook \
    --entry-point=webhook \
    --runtime=nodejs18 \
    --trigger=http \
    --allow-unauthenticated \
    --service-account=linebot-functions@your-project.iam.gserviceaccount.com
```

**Configure LINE Webhook URL**:
- Update LINE channel settings with Cloud Function URL
- Test webhook connectivity

**Test Bot**:
- Add bot as LINE friend
- Send `/stock AAPL` - should return dummy data
- Send `/stock XYZ` - should return dummy data
- Send `hello` - should return help message

**Phase 1 Deliverables**:
- [ ] GCP project created and configured
- [ ] LINE channel created and configured  
- [ ] Credentials stored in Secret Manager
- [ ] Basic webhook function deployed
- [ ] `/stock` command returns dummy data for any ticker
- [ ] Bot responds to commands via LINE app

**Total Phase 1 Time: ~2.5 hours**

## Phase 2: Real Stock Data Integration

### 2.1 Stock API Setup (Time: 30 minutes)

**Register for Stock API**:
- Sign up for Alpha Vantage API (free tier: 25 requests/day)
- Alternative: Yahoo Finance API or Polygon.io
- Store API key in Secret Manager

```bash
# Store stock API key
echo "your_alpha_vantage_api_key" | gcloud secrets create stock-api-key --data-file=-
```

### 2.2 Update Webhook with Real Stock Data (Time: 60 minutes)

**Enhance `functions/webhook/index.js`**:
- Add stock API client function
- Implement ticker validation (basic format check)
- Call external API for real stock data
- Handle API errors gracefully (fallback to dummy data)
- Format real stock response

**Real Stock API Integration**:
```javascript
// Alpha Vantage API call example
const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;

// Response formatting with real data
{
  type: 'text',
  text: `📈 ${symbol} - ${companyName}\n💰 $${price} (${change} ${changePercent}%)\n📅 Last updated: ${lastRefreshed}`
}
```

**Error Handling**:
- Invalid ticker symbols → "Ticker not found" message
- API rate limits → "Try again later" message  
- API down → Fall back to dummy data with warning
- Network errors → Retry once, then error message

### 2.3 Testing and Refinement (Time: 45 minutes)

**Deploy Updated Function**:
```bash
gcloud functions deploy line-webhook \
    --source=functions/webhook \
    --entry-point=webhook \
    --runtime=nodejs18 \
    --trigger=http \
    --allow-unauthenticated \
    --service-account=linebot-functions@your-project.iam.gserviceaccount.com
```

**Test Real Stock Data**:
- Send `/stock AAPL` - should return real Apple stock data
- Send `/stock TSLA` - should return real Tesla stock data  
- Send `/stock INVALID` - should return "not found" error
- Test during market hours vs after hours
- Test API rate limit behavior

**Enhanced Features**:
- Add market status indicator (open/closed)
- Include volume and market cap if available
- Add after-hours pricing if supported
- Improve error messages with suggestions

**Phase 2 Deliverables**:
- [ ] Stock API integration working with real data
- [ ] Error handling for invalid tickers and API issues
- [ ] Rate limiting and fallback mechanisms
- [ ] Enhanced stock information display
- [ ] Comprehensive testing completed

**Total Phase 2 Time: ~2.25 hours**

## Combined Timeline

| Phase | Duration | Focus |
|-------|----------|--------|
| Phase 1 | 2.5 hours | Basic `/stock` command with dummy data |
| Phase 2 | 2.25 hours | Real stock API integration |
| **Total** | **4.75 hours** | **Functional stock bot** |

## Next Steps (Future Phases)

After completing these 2 phases, you'll have a working LINE bot that can return real stock prices. Future enhancements could include:

- Calendar functionality (`/cal` commands)
- Multiple stock tickers in one command
- Stock price alerts and notifications
- Historical price charts
- Portfolio tracking
- More sophisticated error handling and user experience

## Success Criteria for Stock Bot

- [ ] Bot responds to `/stock` commands within 3 seconds
- [ ] 99% uptime for webhook function
- [ ] Error rate below 5% for valid stock tickers
- [ ] Stock prices accurate and up-to-date during market hours
- [ ] Graceful error handling for invalid tickers and API issues
- [ ] Cost remains within free tier limits
- [ ] Basic security practices implemented

This simplified plan focuses on getting a working stock price bot operational quickly, with a clear path for future enhancements.