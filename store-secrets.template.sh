#!/bin/bash

# Store LINE Bot secrets in Google Cloud Secret Manager
# COPY this file to store-secrets.sh and replace the placeholder values with your actual LINE credentials

echo "Storing LINE credentials in Secret Manager..."

# Replace these with your actual values from LINE Developers Console
CHANNEL_ACCESS_TOKEN="your_channel_access_token_here"
CHANNEL_SECRET="your_channel_secret_here" 
CHANNEL_ID="your_channel_id_here"

if [ "$CHANNEL_ACCESS_TOKEN" = "your_channel_access_token_here" ]; then
    echo "❌ Please replace the placeholder values with your actual LINE credentials!"
    echo ""
    echo "Edit this file and replace:"
    echo "- CHANNEL_ACCESS_TOKEN with your Channel Access Token"
    echo "- CHANNEL_SECRET with your Channel Secret"
    echo "- CHANNEL_ID with your Channel ID"
    echo ""
    echo "Get these from: https://developers.line.biz/"
    exit 1
fi

# Store secrets
echo "Storing channel access token..."
echo "$CHANNEL_ACCESS_TOKEN" | gcloud secrets create line-channel-access-token --data-file=-

echo "Storing channel secret..."
echo "$CHANNEL_SECRET" | gcloud secrets create line-channel-secret --data-file=-

echo "Storing channel ID..."
echo "$CHANNEL_ID" | gcloud secrets create line-channel-id --data-file=-

echo "✅ All secrets stored successfully!"
echo ""
echo "Next step: Deploy the webhook function"