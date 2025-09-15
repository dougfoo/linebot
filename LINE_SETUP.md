# LINE Bot Registration & Setup Guide

## Overview

This guide walks you through registering your bot with the LINE platform, configuring the necessary settings, and obtaining the credentials needed for your GCP deployment.

## Prerequisites

- LINE account (personal or business)
- Access to LINE mobile app for testing
- GCP project with Cloud Functions enabled

## Step 1: Create LINE Developers Account

### 1.1 Access LINE Developers Console
1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Click "Log in" and sign in with your LINE account
3. Accept the terms of service if prompted

### 1.2 Create a Provider
1. Click "Create a new provider"
2. Enter provider information:
   - **Provider name**: Your company/organization name (e.g., "MyCompany Bot Services")
   - **Channel description**: Brief description of your bot's purpose
3. Click "Create"

## Step 2: Create Messaging API Channel

### 2.1 Channel Creation
1. In your provider dashboard, click "Create a new channel"
2. Select "Messaging API" from the channel types
3. Fill in the channel information:

   **Basic Information**:
   - **Channel name**: Your bot's display name (e.g., "Stock & Calendar Bot")
   - **Channel description**: Detailed description of bot functionality
   - **Category**: Select "Productivity" or relevant category
   - **Subcategory**: Choose appropriate subcategory
   - **Email address**: Contact email for the bot

   **Additional Settings**:
   - **Privacy policy URL**: Optional, recommended for production
   - **Terms of use URL**: Optional, recommended for production
   - **Region**: Select your target region

4. Upload channel icon (recommended: 1000x1000px PNG)
5. Click "Create"

### 2.2 Verify Channel Creation
After creation, you should see:
- Channel ID (numeric identifier)
- Channel name and description
- Channel status: "Developing" (initially)

## Step 3: Configure Channel Settings

### 3.1 Access Channel Settings
1. Click on your newly created channel
2. Navigate to the "Messaging API" tab

### 3.2 Get Essential Credentials

**Channel Access Token**:
1. Scroll to "Channel access token" section
2. Click "Issue" button
3. Copy and securely store the token (starts with channel access token)
4. **Important**: This token cannot be viewed again, store it safely

**Channel Secret**:
1. Go to "Basic settings" tab
2. Find "Channel secret" section
3. Copy the channel secret
4. This is used for webhook signature verification

**Channel ID**:
- Found in "Basic settings" tab
- Numeric identifier for your channel

### 3.3 Configure Bot Settings

**Response Settings**:
1. In "Messaging API" tab, find "Response settings"
2. **Auto-reply messages**: Turn OFF (we'll handle responses via webhook)
3. **Greeting messages**: Turn ON (optional welcome message)
4. **Webhooks**: Turn ON
5. **Response mode**: Select "Webhook"

**Feature Settings**:
1. **Allow bot to join group chats**: Enable if you want group functionality
2. **Scan QR code in 1-on-1 chat**: Enable for easy sharing
3. **Use webhooks for group chats**: Enable if supporting groups

## Step 4: Webhook Configuration

### 4.1 Set Webhook URL
1. In "Messaging API" tab, find "Webhook URL"
2. Enter your GCP Cloud Function endpoint:
   ```
   https://REGION-PROJECT_ID.cloudfunctions.net/line-webhook
   ```
   Example: `https://us-central1-my-linebot-project.cloudfunctions.net/line-webhook`

3. Click "Update"

### 4.2 Verify Webhook
1. Click "Verify" button next to webhook URL
2. LINE will send a test request to your endpoint
3. Ensure your Cloud Function is deployed and responding
4. Status should show "Success" if properly configured

## Step 5: Bot Information & QR Code

### 5.1 Bot Basic ID
1. In "Messaging API" tab, find "Bot basic ID"
2. This ID (format: @xxxxxxxxx) is how users can search for your bot
3. Note this ID for sharing with users

### 5.2 QR Code
1. In "Messaging API" tab, find "QR code"
2. Click "Create QR code" or use the existing one
3. Users can scan this QR code to add your bot as a friend
4. Download QR code image for sharing

### 5.3 Add Bot for Testing
1. Open LINE mobile app
2. Scan the QR code or search for Bot Basic ID
3. Add bot as friend
4. Send test message to verify webhook is working

## Step 6: Environment Configuration

### 6.1 Store Credentials in GCP Secret Manager

Create secrets for the following values:

```bash
# Channel Access Token
gcloud secrets create line-channel-access-token --data-file=-
# (paste your channel access token)

# Channel Secret  
gcloud secrets create line-channel-secret --data-file=-
# (paste your channel secret)

# Channel ID
gcloud secrets create line-channel-id --data-file=-
# (paste your channel ID)
```

### 6.2 Environment Variables Template

Create `.env.example` file:
```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ID=your_channel_id_here

# External APIs
STOCK_API_KEY=your_stock_api_key_here
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id_here
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret_here

# GCP Configuration
GCP_PROJECT_ID=your_gcp_project_id
GCP_REGION=us-central1
```

## Step 7: Testing Setup

### 7.1 Test Webhook Connectivity

Test your webhook endpoint manually:
```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{
    "destination": "test",
    "events": []
  }'
```

### 7.2 Test Bot Commands

Send these test messages to your bot:
1. `Hello` - Should trigger basic response
2. `/stock AAPL` - Should return stock information
3. `/cal show` - Should prompt for Google authentication
4. `/help` - Should show available commands

### 7.3 Monitor Logs

Check Cloud Function logs:
```bash
gcloud functions logs read line-webhook --limit=50
```

## Step 8: Production Considerations

### 8.1 Account Verification

For production deployment:
1. Apply for **Verified Account** status
2. Provides official badge and enhanced features
3. Required for some advanced features
4. Submit application in LINE Developers Console

### 8.2 Privacy & Terms

Before public release:
1. Create privacy policy
2. Create terms of use
3. Update channel settings with URLs
4. Ensure compliance with data protection regulations

### 8.3 Rate Limits

Be aware of LINE API limits:
- **Push messages**: 500 per month (free), upgrade for more
- **Reply messages**: Unlimited (within reason)
- **Webhook calls**: Automatic rate limiting by LINE

## Troubleshooting

### Common Issues

**Webhook Verification Fails**:
- Ensure Cloud Function is deployed and accessible
- Check function logs for errors
- Verify HTTPS endpoint (HTTP not supported)

**Bot Doesn't Respond**:
- Check webhook URL is correct
- Verify signature validation in code
- Check Cloud Function execution logs

**Messages Not Sending**:
- Verify channel access token is correct
- Check API rate limits
- Ensure bot is friends with test user

**OAuth Issues**:
- Verify Google OAuth credentials
- Check redirect URLs match exactly
- Ensure proper scopes are requested

### Support Resources

- [LINE Developers Documentation](https://developers.line.biz/en/docs/)
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [LINE Bot SDK for Node.js](https://github.com/line/line-bot-sdk-nodejs)

## Security Checklist

- [ ] Channel access token stored securely in Secret Manager
- [ ] Webhook signature verification implemented
- [ ] HTTPS-only communication
- [ ] No credentials in source code
- [ ] Proper IAM permissions on GCP
- [ ] Input validation for all user messages
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive information

Your LINE bot is now ready for development and testing!