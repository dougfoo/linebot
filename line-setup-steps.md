# Quick LINE Setup Steps

## 1. Create LINE Developers Account
1. Go to: https://developers.line.biz/
2. Sign in with your LINE account
3. Accept terms of service

## 2. Create Provider
1. Click "Create a new provider"
2. Provider name: "LineBot Dev" (or any name)
3. Click "Create"

## 3. Create Messaging API Channel
1. Click "Create a new channel"
2. Select "Messaging API"
3. Fill in:
   - Channel name: "Stock Bot"
   - Channel description: "Stock price bot"
   - Category: "Productivity"
   - Subcategory: "Tools"
   - Region: "Japan" (or your region)
4. Click "Create"

## 4. Get Credentials
After channel creation, go to:

**Basic Settings tab:**
- Copy "Channel ID"
- Copy "Channel secret"

**Messaging API tab:**
- Click "Issue" for Channel access token
- Copy the token (save immediately - can't view again!)

## 5. Configure Bot Settings
In Messaging API tab:
- Auto-reply messages: OFF
- Greeting messages: ON (optional)
- Webhooks: ON
- Response mode: Webhook

## Save These Values:
```
Channel ID: [your_channel_id]
Channel Secret: [your_channel_secret]  
Channel Access Token: [your_access_token]
```

We'll use these in the next step!