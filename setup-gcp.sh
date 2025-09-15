#!/bin/bash

# LINE Bot GCP Setup Script - Phase 1
echo "Setting up GCP project for LINE bot..."

# Replace with your desired project ID
PROJECT_ID="linebot-$(date +%s)"
echo "Project ID: $PROJECT_ID"

# Create new project
echo "Creating GCP project..."
gcloud projects create $PROJECT_ID

# Set as default project
echo "Setting as default project..."
gcloud config set project $PROJECT_ID

# Enable required APIs for Phase 1
echo "Enabling required APIs..."
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create service account for Cloud Functions
echo "Creating service account..."
gcloud iam service-accounts create linebot-functions \
    --display-name="LINE Bot Cloud Functions"

# Grant necessary permissions
echo "Setting up IAM permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:linebot-functions@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo "GCP setup complete!"
echo "Project ID: $PROJECT_ID"
echo ""
echo "Next steps:"
echo "1. Follow LINE_SETUP.md to create your LINE bot"
echo "2. Store your LINE credentials in Secret Manager"
echo "3. Create the project structure"