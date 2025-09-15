#!/bin/bash

# Deploy LINE Bot webhook to Google Cloud Functions

echo "Deploying LINE Bot webhook function..."

# Set project and region
PROJECT_ID="linebot-1757911136"
REGION="us-central1"

echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Deploy the function (Gen 1 for simplicity)
gcloud functions deploy line-webhook \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=functions/webhook \
  --entry-point=webhook \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256MB \
  --timeout=60s \
  --set-env-vars=GCP_PROJECT=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Function deployed successfully!"
    echo ""
    echo "🌐 Webhook URL:"
    gcloud functions describe line-webhook --region=$REGION --format="value(serviceConfig.uri)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the webhook URL above"
    echo "2. Go to LINE Developers Console"
    echo "3. Update your bot's webhook URL"
    echo "4. Test by adding the bot as a friend and sending: /stock AAPL"
else
    echo "❌ Deployment failed!"
    exit 1
fi